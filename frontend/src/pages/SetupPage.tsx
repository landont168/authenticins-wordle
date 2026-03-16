import { Button } from "@/components/ui/button";
import { useCreateGame } from "@/hooks/useCreateGame";
import wordleIcon from "@/assets/wordle-icon.png";
import authenticLogo from "@/assets/authentic-insurance.jpg";

export function SetupPage() {
  const createGame = useCreateGame();

  function getCurrentDate() {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={wordleIcon} alt="Wordle Logo" className="w-16 h-16" />
        <h1 className="text-5xl font-black tracking-widest text-foreground">
          Wordle
        </h1>
        <p className="text-md">
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
      <div className="text-sm text-muted-foreground text-center font-bold max-w-xs space-y-1">
        <div className="text-sm text-muted-foreground text-center font-bold max-w-xs space-y-1">
          {getCurrentDate()}
        </div>
        <img
          src={authenticLogo}
          alt="Authentic Insurance"
          className="h-16 object-contain"
        />
      </div>
    </div>
  );
}
