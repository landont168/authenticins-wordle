import { cn } from "@/lib/utils";
import { LetterStatus } from "@/lib/gameUtils";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
];

const statusStyles: Record<LetterStatus, string> = {
  green: "bg-[var(--tile-green)] text-white border-[var(--tile-green)]",
  yellow: "bg-[var(--tile-yellow)] text-white border-[var(--tile-yellow)]",
  gray: "bg-[var(--tile-gray)] text-white border-[var(--tile-gray)]",
  unused: "bg-gray-200 dark:bg-gray-600 text-foreground border-transparent",
};

interface KeyboardProps {
  letterStatuses: Record<string, LetterStatus>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ letterStatuses, onKey, disabled = false }: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-[500px] mx-auto px-1">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => {
            const status: LetterStatus = letterStatuses[key] ?? "unused";
            const isWide = key === "Enter" || key === "Backspace";

            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => onKey(key)}
                className={cn(
                  "flex items-center justify-center",
                  "h-14 rounded font-bold text-xs border",
                  "cursor-pointer select-none",
                  "transition-colors duration-200",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  isWide ? "px-3 min-w-[65px]" : "w-[43px]",
                  statusStyles[status]
                )}
              >
                {key === "Backspace" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
