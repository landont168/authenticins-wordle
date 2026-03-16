import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { GameBoard } from "@/components/GameBoard";
import { Keyboard } from "@/components/Keyboard";
import { Button } from "@/components/ui/button";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { GameOverModal } from "@/components/GameOverModal";
import { useGame } from "@/hooks/useGame";
import { useGameSession, WordLength, GameIds } from "@/hooks/useGameSession";
import { WORD_LENGTHS } from "@/lib/gameStorage";
import { cn } from "@/lib/utils";

const HOW_TO_PLAY_KEY = "wordle_how_to_play_seen";

// ---------------------------------------------------------------------------
// GamePage — owns session state, delegates UI to GameView
// ---------------------------------------------------------------------------

export function GamePage() {
  const {
    gameIds,
    activeLength,
    activeGameId,
    isSwitching,
    handleSwitchMode,
    handleNewGame,
  } = useGameSession();

  if (isSwitching && !activeGameId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Starting game…
      </div>
    );
  }

  if (!activeGameId) return <Navigate to="/" replace />;

  return (
    <GameView
      key={activeGameId}
      gameId={activeGameId}
      activeLength={activeLength}
      gameIds={gameIds}
      isSwitching={isSwitching}
      onSwitchMode={handleSwitchMode}
      onNewGame={handleNewGame}
    />
  );
}

// ---------------------------------------------------------------------------
// GameView — pure UI, no mutation or session logic
// ---------------------------------------------------------------------------

interface GameViewProps {
  gameId: string;
  activeLength: WordLength;
  gameIds: GameIds;
  isSwitching: boolean;
  onSwitchMode: (length: WordLength) => void;
  onNewGame: () => void;
}

function GameView({
  gameId,
  activeLength,
  gameIds,
  isSwitching,
  onSwitchMode,
  onNewGame,
}: GameViewProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(HOW_TO_PLAY_KEY)) {
      setShowHowToPlay(true);
    }
  }, []);

  function closeHowToPlay() {
    localStorage.setItem(HOW_TO_PLAY_KEY, "1");
    setShowHowToPlay(false);
  }

  const {
    gameState,
    isLoading,
    isError,
    currentInput,
    shaking,
    revealingRowIndex,
    letterStatuses,
    handleKey,
    isSubmitting,
  } = useGame(gameId);

  // Stale game: stored ID belongs to a different word length — replace it.
  if (gameState && gameState.word_length !== activeLength) {
    onNewGame();
    return null;
  }

  const isGameOver = gameState ? gameState.status !== "in_progress" : false;
  const animationDone = revealingRowIndex === null;

  // Track whether this game instance was ever seen in progress, so we only
  // trigger the game-over popup when the game actually ends — not when
  // switching back to an already-finished game.
  const wasInProgressRef = useRef(false);
  useEffect(() => {
    if (gameState?.status === "in_progress") wasInProgressRef.current = true;
  }, [gameState?.status]);

  useEffect(() => {
    if (isGameOver && animationDone && gameState && wasInProgressRef.current) {
      const timer = setTimeout(() => setShowGameOver(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, animationDone, gameState]);

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 bg-background">
      <HowToPlayModal open={showHowToPlay} onClose={closeHowToPlay} />
      {gameState &&
        (gameState.status === "won" || gameState.status === "lost") && (
          <GameOverModal
            open={showGameOver}
            onClose={() => setShowGameOver(false)}
            status={gameState.status as "won" | "lost"}
            guesses={gameState.guesses}
            maxGuesses={gameState.max_guesses}
            wordLength={gameState.word_length}
          />
        )}

      {/* Header */}
      <header className="w-full max-w-lg border-b border-border pb-3 grid grid-cols-3 items-center">
        <div className="flex items-center">
          {isGameOver && animationDone && (
            <button
              onClick={onNewGame}
              disabled={isSwitching}
              title="New game"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              New Game
            </button>
          )}
        </div>
        <h1
          className="text-2xl font-black tracking-widest text-foreground text-center"
          onClick={() => navigate("/", { state: { skipRedirect: true } })}
        >
          <span className="cursor-pointer hover:underline">Wordle</span>
        </h1>
        <div className="flex items-center justify-end gap-0.5">
          {WORD_LENGTHS.map((n) => (
            <button
              key={n}
              onClick={() => onSwitchMode(n)}
              disabled={isSwitching}
              className={cn(
                "w-7 h-7 rounded text-xs font-bold transition-colors",
                activeLength === n
                  ? "bg-foreground text-background"
                  : cn(
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      gameIds[n] && "underline decoration-dotted",
                    ),
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </header>

      {/* Answer pill — shown on game over */}
      {isGameOver && animationDone && gameState?.word && (
        <div className="answer-popup fixed top-20 inset-x-0 mx-auto w-fit z-50 bg-foreground text-background text-sm font-bold px-4 py-2 rounded-lg shadow-md tracking-widest uppercase whitespace-nowrap">
          {gameState.word}
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex items-center">
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : isError || !gameState ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive font-medium">Game not found.</p>
            <Button onClick={onNewGame}>Start New Game</Button>
          </div>
        ) : (
          <GameBoard
            wordLength={gameState.word_length}
            maxGuesses={gameState.max_guesses}
            guesses={gameState.guesses}
            currentInput={currentInput}
            shaking={shaking}
            revealingRowIndex={revealingRowIndex}
          />
        )}
      </div>

      {/* Keyboard */}
      <div className="w-full pb-4">
        <Keyboard
          letterStatuses={letterStatuses}
          onKey={handleKey}
          disabled={isLoading || isGameOver || isSubmitting || !animationDone}
        />
      </div>
    </div>
  );
}
