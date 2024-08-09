export const getBestMoveFromStockfish = async (fen, depth = 15) => {
  try {
    const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`);
    const data = await response.json();

    if (data.success && data.bestmove) {
      const bestMove = data.bestmove.split(" ")[1];
      console.log("Best move from Stockfish:", bestMove);
      return bestMove;
    } else {
      console.error("Failed to get the best move from Stockfish.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching best move from Stockfish:", error);
    return null;
  }
};
