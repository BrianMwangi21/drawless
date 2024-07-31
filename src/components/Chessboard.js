"use client"

import { useState } from 'react';
import { Chess, SQUARES } from 'chess.js';
import Chessground from '@react-chess/chessground';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

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

  const onMove = (orig, dest) => {
    if (chess.move({ from: orig, to: dest })) {
      playBlackMove();
    } else {
      console.log("Invalid move:", orig, dest);
    }
  };

  const playBlackMove = () => {
    const possibleMoves = chess.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chess.move(randomMove);

    setConfig({
      ...config,
      fen: chess.fen(),
      turnColor: 'white',
      movable: {
        ...config.movable,
        color: 'white',
        dests: getValidMoves(chess)
      }
    });
  };

  const [chess, setChess] = useState(new Chess());
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
    }
  });

  return (
    <Chessground
      config={config}
      width={600}
      height={600}
    />
  )
}
