import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createGame } from "@/api/client";
import {
  WordLength,
  GameIds,
  loadGameIds,
  saveGameIds,
  loadActiveLength,
  saveActiveLength,
} from "@/lib/gameStorage";

export type { WordLength, GameIds };

interface GameSession {
  gameIds: GameIds;
  activeLength: WordLength;
  activeGameId: string | null;
  isSwitching: boolean;
  handleSwitchMode: (length: WordLength) => void;
  handleNewGame: () => void;
}

export function useGameSession(): GameSession {
  const [gameIds, setGameIds] = useState<GameIds>(loadGameIds);
  const [activeLength, setActiveLength] = useState<WordLength>(loadActiveLength);

  const createMutation = useMutation({
    mutationFn: (length: WordLength) => createGame(length),
    onSuccess: (data, length) => {
      const next = { ...gameIds, [length]: data.game_id };
      saveGameIds(next);
      saveActiveLength(length);
      setGameIds(next);
      setActiveLength(length);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSwitchMode(length: WordLength) {
    saveActiveLength(length);
    setActiveLength(length);
    if (!gameIds[length]) {
      createMutation.mutate(length);
    }
  }

  function handleNewGame() {
    createMutation.mutate(activeLength);
  }

  return {
    gameIds,
    activeLength,
    activeGameId: gameIds[activeLength] ?? null,
    isSwitching: createMutation.isPending,
    handleSwitchMode,
    handleNewGame,
  };
}
