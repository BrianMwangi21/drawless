"use client"

import { useState } from 'react';
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
      playBlackMove();
    } else {
      console.log("Invalid move:", orig, dest);
    }
  };

  const playBlackMove = async () => {
    const fen = chess.fen();
    const bestMove = await getBestMoveFromStockfish(fen);

    if (bestMove) {
      chess.move(bestMove);
      const checkColor = checkForCheck(chess);
      setMoveHistory(prev => [...prev, bestMove]);

      setConfig({
        ...config,
        fen: chess.fen(),
        turnColor: 'white',
        check: checkColor,
        movable: {
          ...config.movable,
          color: 'white',
          dests: getValidMoves(chess),
        },
      });
    }
  };

  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [config, setConfig] = useState({
    fen: chess.fen(),
    orientation: 'white',
    turnColor: 'white',
    movable: {
      free: false,
      color: 'white',
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

  return (
    <div className="flex flex-row gap-2">
      <Chessground
        config={config}
        width={600}
        height={600}
      />
      <div className="flex flex-col h-[600px] w-48">
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
  )
}
