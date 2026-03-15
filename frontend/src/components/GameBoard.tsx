import { GuessRecord } from "@/lib/schemas";
import { Tile } from "./Tile";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  wordLength: number;
  maxGuesses: number;
  guesses: GuessRecord[];
  currentInput: string;
  shaking: boolean;
  revealingRowIndex: number | null;
}

export function GameBoard({
  wordLength,
  maxGuesses,
  guesses,
  currentInput,
  shaking,
  revealingRowIndex,
}: GameBoardProps) {
  const rows = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    const submittedGuess = guesses[rowIndex];
    const isCurrentRow = rowIndex === guesses.length;
    const isRevealingRow = rowIndex === revealingRowIndex;

    return (
      <div
        key={rowIndex}
        className={cn(
          "flex gap-1",
          isCurrentRow && shaking && "row-shake"
        )}
      >
        {Array.from({ length: wordLength }, (_, colIndex) => {
          if (submittedGuess) {
            // Completed row
            const tile = submittedGuess.feedback[colIndex];
            return (
              <Tile
                key={colIndex}
                letter={tile.letter}
                state={tile.result}
                flipDelay={colIndex * 300}
                isRevealing={isRevealingRow}
              />
            );
          }

          if (isCurrentRow) {
            // Active input row
            const letter = currentInput[colIndex];
            return (
              <Tile
                key={colIndex}
                letter={letter}
                state={letter ? "filled" : "empty"}
              />
            );
          }

          // Future empty row
          return <Tile key={colIndex} state="empty" />;
        })}
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center gap-1">
      {rows}
    </div>
  );
}
