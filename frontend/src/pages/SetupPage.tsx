import { Button } from "@/components/ui/button";
import { useCreateGame } from "@/hooks/useCreateGame";

export function SetupPage() {
  const createGame = useCreateGame();

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

      <Button
        className="font-bold tracking-wider uppercase px-10"
        size="lg"
        onClick={() => createGame.mutate(5)}
        disabled={createGame.isPending}
      >
        {createGame.isPending ? "Starting..." : "Play Game"}
      </Button>

      <div className="text-xs text-muted-foreground text-center max-w-xs space-y-1">
        <p>🟩 Right letter, right place</p>
        <p>🟨 Right letter, wrong place</p>
        <p>⬜ Letter not in word</p>
      </div>
    </div>
  );
}
