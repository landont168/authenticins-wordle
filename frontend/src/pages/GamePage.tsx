import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { GameBoard } from "@/components/GameBoard";
import { Keyboard } from "@/components/Keyboard";
import { Button } from "@/components/ui/button";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { useGame } from "@/hooks/useGame";
import { createGame } from "@/api/client";
import { cn } from "@/lib/utils";

const HOW_TO_PLAY_KEY = "wordle_how_to_play_seen";
const WORD_LENGTHS = [5, 6, 7, 8] as const;
type WordLength = (typeof WORD_LENGTHS)[number];
type GameIds = Partial<Record<WordLength, string>>;

function loadGameIds(): GameIds {
  try {
    // Clean up legacy single-game key — word length was unknown so we can't
    // safely slot it into the map without risking a length mismatch.
    localStorage.removeItem("game_id");
    const raw = localStorage.getItem("wordle_games");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGameIds(ids: GameIds) {
  localStorage.setItem("wordle_games", JSON.stringify(ids));
}

// ---------------------------------------------------------------------------
// GamePage — owns game ID map and active length, handles all creation logic
// ---------------------------------------------------------------------------

export function GamePage() {
  const [gameIds, setGameIds] = useState<GameIds>(loadGameIds);
  const [activeLength, setActiveLength] = useState<WordLength>(() => {
    const stored = Number(localStorage.getItem("wordle_active_length"));
    return (WORD_LENGTHS.includes(stored as WordLength) ? stored : 5) as WordLength;
  });

  const createMutation = useMutation({
    mutationFn: (length: WordLength) => createGame(length),
    onSuccess: (data, length) => {
      const next = { ...gameIds, [length]: data.game_id };
      saveGameIds(next);
      localStorage.setItem("wordle_active_length", String(length));
      setGameIds(next);
      setActiveLength(length);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSwitchMode(length: WordLength) {
    localStorage.setItem("wordle_active_length", String(length));
    setActiveLength(length);
    if (!gameIds[length]) {
      createMutation.mutate(length);
    }
  }

  function handleNewGame() {
    createMutation.mutate(activeLength);
  }

  const gameId = gameIds[activeLength] ?? null;

  if (createMutation.isPending && !gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Starting game…
      </div>
    );
  }

  if (!gameId) return <Navigate to="/" replace />;

  return (
    <GameView
      key={gameId}
      gameId={gameId}
      activeLength={activeLength}
      gameIds={gameIds}
      onSwitchMode={handleSwitchMode}
      onNewGame={handleNewGame}
      isSwitching={createMutation.isPending}
    />
  );
}

// ---------------------------------------------------------------------------
// GameView — pure game UI, no creation logic
// ---------------------------------------------------------------------------

function GameView({
  gameId,
  activeLength,
  gameIds,
  onSwitchMode,
  onNewGame,
  isSwitching,
}: {
  gameId: string;
  activeLength: WordLength;
  gameIds: GameIds;
  onSwitchMode: (length: WordLength) => void;
  onNewGame: () => void;
  isSwitching: boolean;
}) {
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
    isSubmitting,
  } = useGame(gameId);

  // Guard: stored game ID belongs to a different word length (e.g. stale data).
  // Kick off a fresh game for the correct length instead of rendering a
  // mismatched board.
  if (gameState && gameState.word_length !== activeLength) {
    onNewGame();
    return null;
  }

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
        <Button onClick={onNewGame}>Start New Game</Button>
      </div>
    );
  }

  const isGameOver = gameState.status !== "in_progress";

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 bg-background">
      <HowToPlayModal open={showHowToPlay} onClose={closeHowToPlay} />

      {/* Header */}
      <header className="w-full max-w-lg border-b border-border pb-3 grid grid-cols-3 items-center">
        <div />
        <h1 className="text-2xl font-black tracking-widest text-foreground text-center">
          Wordle
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
                      // Dot indicator for lengths that have a saved game
                      gameIds[n] && "underline decoration-dotted"
                    )
              )}
            >
              {n}
            </button>
          ))}
        </div>
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
          <Button size="sm" onClick={onNewGame} disabled={isSwitching}>
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
