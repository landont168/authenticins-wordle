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
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-14 h-14 text-2xl font-bold uppercase select-none",
        "transition-transform",
        // While revealing, show the pre-flip (filled) appearance so the color
        // is hidden until the animation snaps it in at the 50% keyframe.
        isRevealing ? stateStyles["filled"] : stateStyles[state],
        isRevealing && "tile-flip"
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
