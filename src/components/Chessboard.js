"use client"

import { useState, useEffect } from 'react';
import { Chess, SQUARES, validateFen } from 'chess.js';
import Chessground from '@react-chess/chessground';
import { RxAvatar } from "react-icons/rx";
import { FaRobot } from "react-icons/fa";
import Timer from './Timer';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import { getBestMoveFromStockfish } from './../utils/stockfish'
import toast from 'react-hot-toast';

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

  const checkForCheckmate = (chessInstance) => {
    if (chessInstance.isCheckmate()) {
      toast("Oooooops! Someone lost. How sad!");
    }
  };

  const checkForDraw = (chessInstance) => {
    if (chessInstance.isDraw()) {
      toast("Oooooops! We are at a draw, how boring!");
      toast("Let's make it interesting!");
      insertRandomPiece(chessInstance);
    }
  };

  const onMove = (orig, dest) => {
    if (chess.move({ from: orig, to: dest })) {
      const checkColor = checkForCheck(chess);
      checkForDraw(chess);
      checkForCheckmate(chess);
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
      checkForDraw(chess);
      checkForCheckmate(chess);
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
    toast("Oooooops! Time is up");
  }

  const insertRandomPiece = (chessInstance) => {
    const history = chessInstance.history({ verbose: true });
    let whiteCapturedPieces = [];
    let blackCapturedPieces = [];

    console.log("IRP: Getting captures from history", history);
    history.forEach(move => {
      if (move.captured) {
        if (move.color == 'w') {
          blackCapturedPieces.push(move.captured);
        } else {
          whiteCapturedPieces.push(move.captured)
        }
      }
    });
    console.log("IRP: White Captured Pieces", whiteCapturedPieces);
    console.log("IRP: Black Captured Pieces", blackCapturedPieces);

    if (whiteCapturedPieces.length === 0 || blackCapturedPieces.length == 0) {
      toast("Both sides must have captured at least one piece each since last random insert");
      return;
    }

    console.log("IRP: Selecting random pieces and checking for empty squares");
    const whitePiece = whiteCapturedPieces[Math.floor(Math.random() * whiteCapturedPieces.length)];
    const blackPiece = blackCapturedPieces[Math.floor(Math.random() * blackCapturedPieces.length)];
    const emptySquares = [];
    SQUARES.forEach(square => {
      if (!chessInstance.get(square)) {
        emptySquares.push(square);
      }
    });
    console.log("IRP: Random White Piece", whitePiece);
    console.log("IRP: Random Black Piece", blackPiece);
    console.log("IRP: Empty Squares", emptySquares);

    let whiteSquare, blackSquare;
    do {
      whiteSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } while (whiteSquare[1] > 4);
    console.log("IRP: Selected White Square", whiteSquare);
    do {
      blackSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } while (blackSquare[1] < 5 || blackSquare === whiteSquare);
    console.log("IRP: Selected Black Square", blackSquare);

    const validMoves = getValidMoves(chessInstance);
    let whitePieceIsSafe = true;
    for (const [square, moves] of validMoves) {
      if (moves.includes(whiteSquare) && chessInstance.get(square).color === 'b') {
        whitePieceIsSafe = false;
        break;
      }
    }
    if (!whitePieceIsSafe) {
      console.log("IRP: White Piece is not safe, running again");
      return insertRandomPiece(chessInstance);
    }
    let blackPieceIsSafe = true;
    for (const [square, moves] of validMoves) {
      if (moves.includes(blackSquare) && chessInstance.get(square).color === 'w') {
        blackPieceIsSafe = false;
        break;
      }
    }
    if (!blackPieceIsSafe) {
      console.log("IRP: Black Piece is not safe, running again");
      return insertRandomPiece(chessInstance);
    }

    chessInstance.put({ type: whitePiece.toLowerCase(), color: 'w' }, whiteSquare);
    chessInstance.put({ type: blackPiece.toLowerCase(), color: 'b' }, blackSquare);

    let validation = validateFen(chessInstance.fen());

    if (!validation.ok) {
      console.log("IRP: New Fen Validation failed, running again");
      return insertRandomPiece(chessInstance);
    }

    toast(`Added white ${whitePiece} at ${whiteSquare} and black ${blackPiece} at ${blackSquare}`, { duration: 8000 });
    setMoveHistory(prev => [...prev, `Added ${whitePiece} at ${whiteSquare}`, `Added ${blackPiece} at ${blackSquare}`]);
    setConfig(prevConfig => ({
      ...prevConfig,
      fen: chessInstance.fen(),
      check: checkForCheck(chessInstance),
      movable: {
        ...prevConfig.movable,
        dests: getValidMoves(chessInstance),
      },
    }));
  }

  const [chess, setChess] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [userColor, setUserColor] = useState('white');
  const [turnColor, setTurnColor] = useState(userColor);
  const [timeControl, setTimeControl] = useState(10);
  const [showTime, setShowTime] = useState(false);
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
            {showTime && <Timer initialTime={timeControl} onPause={userColor == turnColor} onTimeEnd={onTimeEnd} />}
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
            {showTime && <Timer initialTime={timeControl} onPause={userColor == turnColor} onTimeEnd={onTimeEnd} />}
          </div>

        </div>
        <div className="flex flex-col h-[600px] w-48 p-2">
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
        <div className="cursor-pointer p-2 border-2 border-white-500 rounded-md" onClick={() => insertRandomPiece(chess)}>
          Insert Random Pieces
        </div>
      </div>
    </div>
  )
}
