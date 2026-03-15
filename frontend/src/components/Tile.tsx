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

export function Tile({ letter, state, flipDelay = 0, isRevealing = false }: TileProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-14 h-14 text-2xl font-bold uppercase select-none",
        "transition-transform",
        stateStyles[state],
        isRevealing && "tile-flip"
      )}
      style={
        isRevealing
          ? ({ "--flip-delay": `${flipDelay}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {letter}
    </div>
  );
}
