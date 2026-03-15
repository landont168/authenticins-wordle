import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createGame } from "@/api/client";

export function useCreateGame() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      // Write into the multi-game map used by GamePage
      const existing = JSON.parse(
        localStorage.getItem("wordle_games") ?? "{}"
      );
      existing[data.word_length] = data.game_id;
      localStorage.setItem("wordle_games", JSON.stringify(existing));
      localStorage.setItem("wordle_active_length", String(data.word_length));
      navigate("/game");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
