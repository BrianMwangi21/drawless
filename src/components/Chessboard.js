"use client"

import { useState, useEffect } from 'react';
import { Chess, SQUARES } from 'chess.js';
import Chessground from '@react-chess/chessground';
import { RxAvatar } from "react-icons/rx";
import { FaRobot } from "react-icons/fa";
import Timer from './Timer';
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
    setTurnColor(prevColor => prevColor == 'white' ? 'black' : 'white');
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
      setTurnColor(prevColor => prevColor == 'white' ? 'black' : 'white');
    }
  };

  const resetGame = () => {
    chess.reset();
    resetTimes();
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

    // If user is black, play the first move
    if (userColor == 'black') {
      playOpponentMove();
    }
  }

  const changeOrientation = () => {
    chess.reset();
    resetTimes();
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
      setTurnColor(newColor);
      return newColor;
    });
  }

  const resetTimes = () => {
    const event = new CustomEvent('timeResetEvent', {});
    window.dispatchEvent(event);
  }

  const onTimeEnd = () => {
    // What happens when time ends is a mystery
  }

  const insertRandomPiece = () => {
    // Here is where the magic is
  }

  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [userColor, setUserColor] = useState('white');
  const [turnColor, setTurnColor] = useState(userColor);
  const [timeControl, setTimeControl] = useState(10);
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
      <div className="flex flex-row gap-6 h-fit">
        <div className="flex flex-col gap-2 h-fit">
          <div className="p-2 flex flex-row gap-4 justify-between items-center">
            <div className="flex flex-row gap-2 justify-start items-center">
              <FaRobot size={32} />
              <p className="font-bold text-xl">Bot (Stockfish - depth 10)</p>
            </div>
            <Timer initialTime={timeControl} onPause={userColor == turnColor} onTimeEnd={onTimeEnd} />
          </div>

          <Chessground
            config={config}
            width={500}
            height={500}
          />

          <div className="p-2 flex flex-row gap-4 justify-between items-center">
            <div className="flex flex-row gap-2 justify-start items-center">
              <RxAvatar size={32} />
              <p className="font-bold text-xl">You</p>
            </div>
            <Timer initialTime={timeControl} onPause={userColor != turnColor} onTimeEnd={onTimeEnd} />
          </div>

        </div>
        <div className="flex flex-col h-full w-48 p-2">
          <p className="font-bold w-full text-xl border-b-2 border-white-500">Moves</p>

          <div className="h-full w-full flex-col gap-2 overflow-auto">
            {moveHistory.reduce((acc, move, index) => {
              if (index % 2 === 0) {
                acc.push({
                  move_number: Math.floor(index / 2) + 1,
                  white_move: move,
                  black_move: null,
                });
              } else {
                acc[acc.length - 1].black_move = move;
              }
              return acc;
            }, []).map((movePair, index) => (
              <div key={index} className="flex flex-row gap-2 items-center justify-between">
                <p>{movePair.move_number}. {movePair.white_move}</p>
                <p>{movePair.black_move}</p>
              </div>
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
