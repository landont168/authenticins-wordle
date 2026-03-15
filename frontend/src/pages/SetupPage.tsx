import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateGame } from "@/hooks/useCreateGame";

export function SetupPage() {
  const [wordLength, setWordLength] = useState(5);
  const createGame = useCreateGame();

  function handleStart() {
    createGame.mutate(wordLength);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-background">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-5xl font-black tracking-widest uppercase text-foreground">
          Wordle
        </h1>
        <p className="text-muted-foreground text-sm">
          Guess the hidden word. You get{" "}
          <span className="font-semibold text-foreground">word length + 1</span>{" "}
          tries.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium text-foreground">
            Word Length
          </label>
          <Select
            value={String(wordLength)}
            onValueChange={(v) => setWordLength(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select word length" />
            </SelectTrigger>
            <SelectContent>
              {[5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} letters ({n + 1} guesses)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full font-bold tracking-wider uppercase"
          size="lg"
          onClick={handleStart}
          disabled={createGame.isPending}
        >
          {createGame.isPending ? "Starting..." : "Start Game"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center max-w-xs space-y-1">
        <p>🟩 Right letter, right place</p>
        <p>🟨 Right letter, wrong place</p>
        <p>⬜ Letter not in word</p>
      </div>
    </div>
  );
}
