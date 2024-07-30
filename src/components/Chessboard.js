"use client"

import Chessground from '@react-chess/chessground';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

export default function Chessboard() {
  return (
    <Chessground config={{}} width={600} height={600} />
  )
}
