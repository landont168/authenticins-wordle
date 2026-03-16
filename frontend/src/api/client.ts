import axios from "axios";
import {
  GameCreateResponse,
  GameCreateResponseSchema,
  GameStateResponse,
  GameStateResponseSchema,
  GuessResponse,
  GuessResponseSchema,
} from "@/lib/schemas";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Surface backend error detail messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail ?? err.message;
    return Promise.reject(new Error(message));
  }
);

export async function createGame(wordLength: number): Promise<GameCreateResponse> {
  const { data } = await api.post("/games", { word_length: wordLength });
  return GameCreateResponseSchema.parse(data);
}

export async function getGame(gameId: string): Promise<GameStateResponse> {
  const { data } = await api.get(`/games/${gameId}`);
  return GameStateResponseSchema.parse(data);
}

export async function submitGuess(gameId: string, guess: string): Promise<GuessResponse> {
  const { data } = await api.post(`/games/${gameId}/guesses`, { guess });
  return GuessResponseSchema.parse(data);
}
