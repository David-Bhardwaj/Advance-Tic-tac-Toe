
import React, { useState, useEffect } from "react";

const BOARD_SIZES = [3, 4, 5];
const AI_LEVELS = [
  { value: "easy", label: "Easy (Random)" },
  { value: "medium", label: "Medium (Smart)" },
  { value: "hard", label: "Hard (Unbeatable)" },
];
const PLAYER_COLORS = { X: "black", O: "white" };

export default function AdvancedTicTacToe() {
  //* ==================== STATE VARIABLES ====================
  // Array for game board cells (null, or 'X'/'O')
  const [board, setBoard] = useState(Array(9).fill(null));
  // Current player's symbol ('X' or 'O')
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // Scores for each player
  const [scores, setScores] = useState({ X: 0, O: 0 });
  // Whether the game is active (not won/drawn)
  const [gameActive, setGameActive] = useState(true);
  // Whether playing against AI
  const [isAIMode, setIsAIMode] = useState(false);
  // Board dimension (default 3x3)
  const [boardSize, setBoardSize] = useState(3);
  // AI difficulty level
  const [aiDifficulty, setAIDifficulty] = useState("easy");
  // Winner or draw status message
  const [winnerMsg, setWinnerMsg] = useState("");
  // Theme mode (dark/light)
  const [darkMode, setDarkMode] = useState(false);

  // *=========== LIFECYCLE - RESET BOARD WHEN SIZE CHANGES ===========
  useEffect(() => {
    // When board size changes, reinitialize board and reset game
    setBoard(Array(boardSize * boardSize).fill(null));
    setCurrentPlayer("X");
    setGameActive(true);
    setWinnerMsg("");
  }, [boardSize]);

  //* =========== LIFECYCLE - AI MOVE HANDLER ===========
  useEffect(() => {
    // When playing vs AI and it's AI's turn, trigger AI move with a short delay
    if (isAIMode && currentPlayer === "O" && gameActive) {
      const timer = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(timer);
    }
  }, [isAIMode, currentPlayer, gameActive, board, aiDifficulty, boardSize]);

  //* =================== GAME LOGIC FUNCTIONS ===================

  // Handle click on a board cell
  function handleCellClick(idx) {
    // Prevent clicking on a non-empty cell or if the game is over
    if (!gameActive || board[idx]) return;

    // Place current player's symbol in clicked cell
    const nextBoard = [...board];
    nextBoard[idx] = currentPlayer;
    setBoard(nextBoard);

    // Check for winner or draw
    if (checkWinner(nextBoard, boardSize, currentPlayer)) {
      // If current player wins, update scores, announce winner, end game
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
      setWinnerMsg(`🎉 ${currentPlayer} Wins!`);
      setGameActive(false);
    } else if (isDraw(nextBoard)) {
      // If board full and no winner, it's a draw
      setWinnerMsg("🤝 It's a Draw!");
      setGameActive(false);
    } else {
      // Otherwise, switch turn
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  }

  // Check if current player has won (rows, columns, diagonals)
  function checkWinner(arr, size, player) {
    // Helper to check one line (returns true if all same player)
    const checkLine = (start, step) =>
      Array.from({ length: size }, (_, i) => arr[start + i * step]).every(
        (cell) => cell === player
      );

    // Check rows
    for (let r = 0; r < size; r++) {
      if (arr[r * size] && checkLine(r * size, 1)) return true;
    }
    // Check columns
    for (let c = 0; c < size; c++) {
      if (arr[c] && checkLine(c, size)) return true;
    }
    // Check diagonals
    if (arr[0] && checkLine(0, size + 1)) return true;
    if (arr[size - 1] && checkLine(size - 1, size - 1)) return true;

    return false;
  }

  // Check if the game is a draw (board is full, no winner)
  function isDraw(arr) {
    return (
      arr.every((cell) => cell) &&
      !checkWinner(arr, boardSize, "X") &&
      !checkWinner(arr, boardSize, "O")
    );
  }

  //* =================== AI LOGIC ===================

  // Master AI move function, calls appropriate difficulty
  function makeAIMove() {
    let aiMove = null;
    if (aiDifficulty === "easy") aiMove = getRandomMove();
    else if (aiDifficulty === "medium") aiMove = getMediumMove();
    else if (aiDifficulty === "hard") aiMove = getBestMove();
    else aiMove = getRandomMove();

    // Click the AI's chosen cell programmatically
    if (aiMove !== null) handleCellClick(aiMove);
  }

  // Easy: random empty cell
  function getRandomMove() {
    const empty = board
      .map((cell, i) => (cell === null ? i : null))
      .filter((i) => i !== null);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Medium: win if possible, block if needed, else random
  function getMediumMove() {
    // Try to win
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const test = [...board];
        test[i] = "O";
        if (checkWinner(test, boardSize, "O")) return i;
      }
    }
    // Try to block X
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const test = [...board];
        test[i] = "X";
        if (checkWinner(test, boardSize, "X")) return i;
      }
    }
    // Take center if available
    const center = Math.floor((boardSize * boardSize) / 2);
    if (board[center] === null) return center;
    // Else random
    return getRandomMove();
  }

  // Hard: Minimax for unbeatable AI
  function getBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // Minimax algorithm implementation for AI
  function minimax(arr, depth, isMaximizing) {
    if (checkWinner(arr, boardSize, "O")) return 10 - depth;
    if (checkWinner(arr, boardSize, "X")) return depth - 10;
    if (arr.every((cell) => cell)) return 0; // Draw

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === null) {
          arr[i] = "O";
          best = Math.max(best, minimax(arr, depth + 1, false));
          arr[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === null) {
          arr[i] = "X";
          best = Math.min(best, minimax(arr, depth + 1, true));
          arr[i] = null;
        }
      }
      return best;
    }
  }

  //* ============= UI & HELPER FUNCTIONS =============

  // Reset board, winner, and make X start
  function resetGame() {
    setBoard(Array(boardSize * boardSize).fill(null));
    setCurrentPlayer("X");
    setGameActive(true);
    setWinnerMsg("");
  }

  // Toggle AI mode and reset game
  function toggleAIMode() {
    setIsAIMode((v) => !v);
    resetGame();
  }

  // Toggle theme (dark/light mode)
  function toggleTheme() {
    setDarkMode((v) => !v);
  }

  //* ============= RENDER GAME BOARD =============
  function renderBoard() {
    return (
      <div
        className="grid"
        style={{
          display: "grid",
          gap: 5,
          margin: "0 auto",
          width: "fit-content",
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            className="col"
            style={{
              border: "2px solid white",
              height: 60,
              width: 60,
              cursor: cell || !gameActive ? "not-allowed" : "pointer",
              fontSize: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: cell ? (cell === "X" ? "White" : "Black") : "Grey",
              color: cell ? PLAYER_COLORS[cell] : "#333",
              transition: "background 0.3s",
            }}
            onClick={() => handleCellClick(i)}
          >
            {cell}
          </div>
        ))}
      </div>
    );
  }

  //* ============= MAIN RENDER =============
  return (
    <div className={`ttt-root${darkMode ? " dark-mode" : ""}`}>
      <div className="container">
        {/* Scoreboard and Theme Toggle */}
        <div
          className="game-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <div
            className="scoreboard"
            style={{
              display: "flex",
              gap: 20,
              background: "rgba(255,255,255,0.3)",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <div>
              Player X: <span>{scores.X}</span>
            </div>
            <div>
              Player O: <span>{scores.O}</span>
            </div>
          </div>
          <button
            id="theme-btn"
            onClick={toggleTheme}
            style={{
              background: "#2196F3",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: 5,
            }}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Player Turn Display */}
        <div
          id="turn-display"
          className="player-turn"
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            margin: "10px 0",
            color: PLAYER_COLORS[currentPlayer],
          }}
        >
          Player {currentPlayer}'s Turn
        </div>

        {/* Board size selector */}
        <div className="board-size-selector" style={{ margin: "10px 0" }}>
          <label htmlFor="board-size">Board Size: </label>
          <select
            id="board-size"
            value={boardSize}
            onChange={(e) => setBoardSize(Number(e.target.value))}
          >
            {BOARD_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}x{size}
              </option>
            ))}
          </select>
        </div>

        {/* AI Difficulty selector */}
        <div className="ai-difficulty" style={{ margin: "10px 0" }}>
          <label htmlFor="ai-difficulty">AI Difficulty: </label>
          <select
            id="ai-difficulty"
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value)}
          >
            {AI_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Game board grid */}
        <div id="grid">{renderBoard()}</div>

        {/* Winner/Draw Display */}
        <div
          id="winner-display"
          style={{
            marginTop: 15,
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {winnerMsg}
        </div>

        {/* Controls: Restart & AI Toggle */}
        <div
          className="controls"
          style={{
            display: "flex",
            gap: 10,
            marginTop: 15,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            id="restart-btn"
            onClick={resetGame}
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: 5,
            }}
          >
            🔄 Restart Game
          </button>
          <button
            id="ai-btn"
            onClick={toggleAIMode}
            style={{
              background: "#2196F3",
              color: "white",
              padding: "8px 15px",
              border: "none",
              borderRadius: 5,
            }}
          >
            {isAIMode ? "👤 Play vs Human" : "🤖 Play vs AI"}
          </button>
        </div>
      </div>

      {/* Confetti Animation Keyframes */}
      <style>
        {`
        .ttt-root {
          font-family: Arial, sans-serif;
          background: grey;
          min-height: 100vh;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ttt-root.dark-mode {
          background: #222;
          color: #fff;
        }
        .ttt-root .container {
          background: linear-gradient(violet, orange);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
        }
        .ttt-root.dark-mode .container {
          background: linear-gradient(#333, #111);
        }
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
}
