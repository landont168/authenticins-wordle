import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createGame } from "@/api/client";

export function useCreateGame() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createGame,
    onSuccess: (data) => {
      localStorage.setItem("game_id", data.game_id);
      navigate(`/game/${data.game_id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
