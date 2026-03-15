import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createGame } from "@/api/client";
import {
  WordLength,
  loadGameIds,
  saveGameIds,
  saveActiveLength,
} from "@/lib/gameStorage";

export function useCreateGame() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      const length = data.word_length as WordLength;
      saveGameIds({ ...loadGameIds(), [length]: data.game_id });
      saveActiveLength(length);
      navigate("/game");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
