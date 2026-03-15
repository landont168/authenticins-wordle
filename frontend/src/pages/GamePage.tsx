import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { GameBoard } from "@/components/GameBoard";
import { Keyboard } from "@/components/Keyboard";
import { Button } from "@/components/ui/button";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { useGame } from "@/hooks/useGame";

const HOW_TO_PLAY_KEY = "wordle_how_to_play_seen";

export function GamePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <Navigate to="/" replace />;

  return <GameView gameId={id} />;
}

function GameView({ gameId }: { gameId: string }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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
    handleNewGame,
    isSubmitting,
  } = useGame(gameId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading game…
      </div>
    );
  }

  if (isError || !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">Game not found.</p>
        <Button onClick={handleNewGame}>Start New Game</Button>
      </div>
    );
  }

  const isGameOver = gameState.status !== "in_progress";

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 bg-background">
      <HowToPlayModal open={showHowToPlay} onClose={closeHowToPlay} />
      {/* Header */}
      <header className="w-full max-w-lg border-b border-border pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-widest uppercase text-foreground">
          Wordle
        </h1>
        <span className="text-sm text-muted-foreground">
          {gameState.word_length} letters
        </span>
      </header>

      {/* Game over banner */}
      {isGameOver && (
        <div className="w-full max-w-lg rounded-lg border bg-muted px-4 py-3 flex items-center justify-between gap-4">
          <div>
            {gameState.status === "won" ? (
              <p className="font-semibold text-[var(--tile-green)]">
                You won! 🎉
              </p>
            ) : (
              <p className="font-semibold text-foreground">
                The word was{" "}
                <span className="font-black tracking-widest">
                  {gameState.word}
                </span>
              </p>
            )}
          </div>
          <Button size="sm" onClick={handleNewGame}>
            New Game
          </Button>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex items-center">
        <GameBoard
          wordLength={gameState.word_length}
          maxGuesses={gameState.max_guesses}
          guesses={gameState.guesses}
          currentInput={currentInput}
          shaking={shaking}
          revealingRowIndex={revealingRowIndex}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full pb-4">
        <Keyboard
          letterStatuses={letterStatuses}
          onKey={handleKey}
          disabled={isGameOver || isSubmitting || revealingRowIndex !== null}
        />
      </div>
    </div>
  );
}
