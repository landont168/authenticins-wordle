import {
  GameCreateResponse,
  GameCreateResponseSchema,
  GameStateResponse,
  GameStateResponseSchema,
  GuessResponse,
  GuessResponseSchema,
} from "@/lib/schemas";

const API_URL = "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the descriptive error message from the backend
    throw new Error(data?.detail ?? `Request failed: ${res.status}`);
  }

  return data as T;
}

export async function createGame(wordLength: number): Promise<GameCreateResponse> {
  const data = await request<unknown>("/games", {
    method: "POST",
    body: JSON.stringify({ word_length: wordLength }),
  });
  return GameCreateResponseSchema.parse(data);
}

export async function getGame(gameId: string): Promise<GameStateResponse> {
  const data = await request<unknown>(`/games/${gameId}`);
  return GameStateResponseSchema.parse(data);
}

export async function submitGuess(
  gameId: string,
  guess: string
): Promise<GuessResponse> {
  const data = await request<unknown>(`/games/${gameId}/guesses`, {
    method: "POST",
    body: JSON.stringify({ guess }),
  });
  return GuessResponseSchema.parse(data);
}
