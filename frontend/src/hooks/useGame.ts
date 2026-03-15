import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getGame, submitGuess } from "@/api/client";
import { GameStateResponse, GuessRecord } from "@/lib/schemas";
import { getLetterStatuses, flipDuration, LetterStatus } from "@/lib/gameUtils";

export type { LetterStatus };

export function useGame(gameId: string) {
  const queryClient = useQueryClient();

  const [currentInput, setCurrentInput] = useState("");
  const [shaking, setShaking] = useState(false);
  const [revealingRowIndex, setRevealingRowIndex] = useState<number | null>(null);
  const blockInput = useRef(false);

  // ---------------------------------------------------------------------------
  // Query — loads and caches game state
  // ---------------------------------------------------------------------------

  const { data: gameState, isLoading, isError } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => getGame(gameId),
    enabled: !!gameId,
  });

  // ---------------------------------------------------------------------------
  // Submit guess mutation
  // ---------------------------------------------------------------------------

  const guessMutation = useMutation({
    mutationFn: (guess: string) => submitGuess(gameId, guess),
    onMutate: () => {
      blockInput.current = true;
    },
    onSuccess: (data, guess) => {
      // Snapshot current state to get the correct row index
      const prev = queryClient.getQueryData<GameStateResponse>(["game", gameId]);
      const newRowIndex = prev?.guesses.length ?? 0;

      // Immediately write the new guess + feedback into the cache so the board
      // has tile data before the flip animation starts — no blank-flash glitch.
      if (prev) {
        const newGuess: GuessRecord = {
          guess: guess.toUpperCase(),
          feedback: data.feedback,
        };
        queryClient.setQueryData<GameStateResponse>(["game", gameId], {
          ...prev,
          guesses: [...prev.guesses, newGuess],
          guesses_remaining: data.guesses_remaining,
          status: data.status,
          word: data.word ?? prev.word,
        });
      }

      setCurrentInput("");
      setRevealingRowIndex(newRowIndex);

      const duration = flipDuration(prev?.word_length ?? 5);
      setTimeout(() => {
        setRevealingRowIndex(null);
        blockInput.current = false;

        if (data.status === "won") {
          toast.success("Brilliant! You got it! 🎉");
        } else if (data.status === "lost") {
          toast.error(`The word was ${data.word ?? ""}`, { duration: 6000 });
        }
      }, duration);
    },
    onError: (err: Error) => {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      toast.error(err.message);
      blockInput.current = false;
    },
  });

  // ---------------------------------------------------------------------------
  // Keyboard handler
  // ---------------------------------------------------------------------------

  const handleKey = useCallback(
    (key: string) => {
      if (!gameState || gameState.status !== "in_progress") return;
      if (blockInput.current) return;

      const wordLength = gameState.word_length;

      if (key === "Enter") {
        if (currentInput.length < wordLength) {
          setShaking(true);
          setTimeout(() => setShaking(false), 600);
          toast.error("Not enough letters");
          return;
        }
        const alreadyGuessed = gameState.guesses.some(
          (g) => g.guess === currentInput
        );
        if (alreadyGuessed) {
          setShaking(true);
          setTimeout(() => setShaking(false), 600);
          toast.error("Already guessed that word");
          return;
        }
        guessMutation.mutate(currentInput);
      } else if (key === "Backspace") {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(key) && currentInput.length < wordLength) {
        setCurrentInput((prev) => prev + key.toUpperCase());
      }
    },
    [gameState, currentInput, guessMutation]
  );

  // ---------------------------------------------------------------------------
  // Physical keyboard listener
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      handleKey(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  // Exclude the currently-animating row so keyboard colors only update
  // after all tiles in that row have finished flipping.
  const revealedGuesses = gameState
    ? gameState.guesses.filter(
        (_, i) => revealingRowIndex === null || i < revealingRowIndex
      )
    : [];
  const letterStatuses = getLetterStatuses(revealedGuesses);

  return {
    gameState,
    isLoading,
    isError,
    currentInput,
    shaking,
    revealingRowIndex,
    letterStatuses,
    handleKey,
    isSubmitting: guessMutation.isPending,
  };
}
