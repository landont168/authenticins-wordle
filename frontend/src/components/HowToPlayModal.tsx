import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

function ExampleRow({
  word,
  highlightIndex,
  result,
}: {
  word: string;
  highlightIndex: number;
  result: "green" | "yellow" | "gray";
}) {
  const colors = {
    green: "bg-[var(--tile-green)] border-[var(--tile-green)] text-white",
    yellow: "bg-[var(--tile-yellow)] border-[var(--tile-yellow)] text-white",
    gray: "bg-[var(--tile-gray)] border-[var(--tile-gray)] text-white",
  };

  return (
    <div className="flex gap-1">
      {word.split("").map((letter, i) => (
        <div
          key={i}
          className={cn(
            "w-9 h-9 flex items-center justify-center font-bold text-sm border-2 uppercase",
            i === highlightIndex
              ? colors[result]
              : "border-[var(--tile-border)] text-foreground"
          )}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onClose={onClose}
      className={cn(
        "rounded-xl border border-border bg-background text-foreground shadow-xl",
        "w-full max-w-sm mx-auto p-0",
        "backdrop:bg-black/50",
        "open:animate-in open:fade-in-0 open:zoom-in-95"
      )}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <h2 className="text-base font-black tracking-widest uppercase">
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4 text-sm">
          <p>
            Guess the hidden word in{" "}
            <strong>word length + 1</strong> tries. Each guess must be a valid word.
          </p>

          <ul className="flex flex-col gap-1 list-disc list-inside text-muted-foreground">
            <li>Letters 5–8 long — you choose at the start</li>
            <li>You can play as many games as you want</li>
            <li>You cannot guess the same word twice</li>
          </ul>

          <div className="border-t border-border pt-4 flex flex-col gap-3">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Examples
            </p>

            <div className="flex flex-col gap-1">
              <ExampleRow word="WEARY" highlightIndex={0} result="green" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">W</strong> is in the word and in the correct spot.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <ExampleRow word="PILOT" highlightIndex={1} result="yellow" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">I</strong> is in the word but in the wrong spot.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <ExampleRow word="VAGUE" highlightIndex={3} result="gray" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">G</strong> is not in the word at all.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Button className="w-full" onClick={onClose}>
            Got it — let's play!
          </Button>
        </div>
      </div>
    </dialog>
  );
}
