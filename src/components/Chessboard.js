"use client"

import { useState, useEffect } from 'react';
import { Chess, SQUARES } from 'chess.js';
import Chessground from '@react-chess/chessground';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import { getBestMoveFromStockfish } from './../utils/stockfish'

export default function Chessboard() {
  const getValidMoves = (chessInstance) => {
    const dests = new Map();
    SQUARES.forEach(square => {
      const moves = chessInstance.moves({ square, verbose: true });
      if (moves.length) {
        dests.set(square, moves.map(move => move.to))
      }
    });
    return dests;
  };

  const checkForCheck = (chessInstance) => {
    if (chessInstance.inCheck()) {
      return chessInstance.turn() === 'w' ? 'white' : 'black';
    }
    return false;
  };

  const onMove = (orig, dest) => {
    if (chess.move({ from: orig, to: dest })) {
      const checkColor = checkForCheck(chess);
      setMoveHistory(prev => [...prev, `${orig}${dest}`]);
      setConfig(prevConfig => ({
        ...prevConfig,
        fen: chess.fen(),
        check: checkColor,
      }));
      playOpponentMove();
    } else {
      console.log("Invalid move:", orig, dest);
    }
  };

  const playOpponentMove = async () => {
    const fen = chess.fen();
    const bestMove = await getBestMoveFromStockfish(fen);

    if (bestMove) {
      chess.move(bestMove);
      const checkColor = checkForCheck(chess);
      setMoveHistory(prev => [...prev, bestMove]);

      setConfig(prevConfig => ({
        ...prevConfig,
        fen: chess.fen(),
        check: checkColor,
        movable: {
          ...prevConfig.movable,
          dests: getValidMoves(chess),
        },
      }));
    }
  };

  const resetGame = () => {
    chess.reset();
    setMoveHistory([]);
    setConfig(prevConfig => ({
      ...prevConfig,
      fen: chess.fen(),
      orientation: userColor,
      turnColor: userColor,
      movable: {
        ...prevConfig.movable,
        color: userColor,
        dests: getValidMoves(chess),
      },
      highlight: {
        lastMove: false,
        check: false,
      },
    }));
  }

  const changeOrientation = () => {
    chess.reset();
    setMoveHistory([]);
    setUserColor(prevColor => {
      const newColor = prevColor === 'white' ? 'black' : 'white';
      setConfig(prevConfig => ({
        ...prevConfig,
        fen: chess.fen(),
        orientation: newColor,
        turnColor: newColor,
        movable: {
          ...prevConfig.movable,
          color: newColor,
          dests: getValidMoves(chess),
        },
        highlight: {
          lastMove: false,
          check: false,
        },
      }));
      return newColor;
    });
  }

  const insertRandomPiece = () => {
    // Here is where the magic is
  }

  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [userColor, setUserColor] = useState('white');
  const [config, setConfig] = useState({
    fen: chess.fen(),
    orientation: userColor,
    turnColor: userColor,
    movable: {
      free: false,
      color: userColor,
      showDests: true,
      dests: getValidMoves(chess),
      events: {
        after: (orig, dest, metadata) => {
          onMove(orig, dest);
        },
      }
    },
    highlight: {
      lastMove: true,
      check: true,
    },
    drawable: {
      enabled: true,
      visible: true,
      eraseOnClick: true,
    },
  });

  useEffect(() => {
    if (userColor == 'black') {
      playOpponentMove();
    }
  }, [userColor]);

  return (
    <div className="w-full h-full flex flex-col gap-4 justify-center place-items-center">
      <div className="flex flex-row gap-2 h-fit">
        <Chessground
          config={config}
          width={500}
          height={500}
        />
        <div className="flex flex-col h-[500px] w-48">
          <p className="font-bold w-full text-xl border-b-2 border-white-500">Moves</p>

          <div className="h-full w-full flex-col gap-2 overflow-auto">
            {moveHistory.reduce((acc, move, index) => {
              if (index % 2 === 0) {
                acc.push(`${Math.floor(index / 2) + 1}. ${move}`);
              } else {
                acc[acc.length - 1] += ` ${move}`;
              }
              return acc;
            }, []).map((movePair, index) => (
              <p key={index} className="px-2">{movePair}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <div className="cursor-pointer p-2 border-2 border-white-500 rounded-md" onClick={resetGame}>
          Reset Game
        </div>
        <div className="cursor-pointer p-2 border-2 border-white-500 rounded-md" onClick={changeOrientation}>
          Play as {userColor === 'white' ? 'Black' : 'White'}
        </div>
        <div className="cursor-pointer p-2 border-2 border-white-500 rounded-md" onClick={insertRandomPiece}>
          Insert Random Pieces
        </div>
      </div>
    </div>
  )
}
