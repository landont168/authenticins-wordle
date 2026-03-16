import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TileState = "empty" | "filled" | "green" | "yellow" | "gray";

interface TileProps {
  letter?: string;
  state: TileState;
  flipDelay?: number; // ms
  isRevealing?: boolean;
}

const stateStyles: Record<TileState, string> = {
  empty: "bg-[var(--tile-empty)] border-2 border-[var(--tile-border)]",
  filled: "bg-[var(--tile-empty)] border-2 border-[var(--tile-filled-border)]",
  green: "bg-[var(--tile-green)] border-2 border-[var(--tile-green)] text-white",
  yellow: "bg-[var(--tile-yellow)] border-2 border-[var(--tile-yellow)] text-white",
  gray: "bg-[var(--tile-gray)] border-2 border-[var(--tile-gray)] text-white",
};

const targetColors: Record<TileState, string> = {
  empty: "var(--tile-empty)",
  filled: "var(--tile-empty)",
  green: "var(--tile-green)",
  yellow: "var(--tile-yellow)",
  gray: "var(--tile-gray)",
};

export function Tile({ letter, state, flipDelay = 0, isRevealing = false }: TileProps) {
  const [popping, setPopping] = useState(false);
  const prevLetterRef = useRef(letter);

  useEffect(() => {
    // Only pop when a letter is newly added (not on backspace or clear)
    if (letter && !prevLetterRef.current) {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 100);
      return () => clearTimeout(t);
    }
    prevLetterRef.current = letter;
  }, [letter]);

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-14 h-14 text-2xl font-bold uppercase select-none",
        isRevealing ? stateStyles["filled"] : stateStyles[state],
        isRevealing && "tile-flip",
        popping && "tile-pop"
      )}
      style={
        isRevealing
          ? ({
              "--flip-delay": `${flipDelay}ms`,
              "--target-color": targetColors[state],
            } as React.CSSProperties)
          : undefined
      }
    >
      {letter}
    </div>
  );
}
