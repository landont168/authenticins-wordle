import { useEffect, useRef } from "react";
import { Share2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GuessRecord } from "@/lib/schemas";

interface GameOverModalProps {
  open: boolean;
  onClose: () => void;
  status: "won" | "lost";
  guesses: GuessRecord[];
  maxGuesses: number;
  wordLength: number;
}

const EMOJI: Record<string, string> = {
  green: "🟩",
  yellow: "🟨",
  gray: "⬛",
};

function buildShareText(
  guesses: GuessRecord[],
  maxGuesses: number,
  wordLength: number,
  won: boolean
): string {
  const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  const grid = guesses
    .map((g) => g.feedback.map((t) => EMOJI[t.result] ?? "⬛").join(""))
    .join("\n");
  return `Wordle (${wordLength} letters) ${score}\n\n${grid}`;
}

export function GameOverModal({
  open,
  onClose,
  status,
  guesses,
  maxGuesses,
  wordLength,
}: GameOverModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
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

  function handleShare() {
    const text = buildShareText(guesses, maxGuesses, wordLength, status === "won");
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  }

  const won = status === "won";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className={cn(
        "rounded-xl border border-border bg-background text-foreground shadow-xl",
        "w-full max-w-xs mx-auto p-0",
        "backdrop:bg-black/50",
        "open:animate-in open:fade-in-0 open:zoom-in-95"
      )}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <h2 className="text-base font-black tracking-widest uppercase">
            {won ? "Congrats! 🎉" : "Nice Try!"}
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
        <div className="px-5 py-4 text-sm text-muted-foreground">
          {won
            ? `You got it in ${guesses.length} of ${maxGuesses} tries. Share your result!`
            : `Better luck next time. Share your result!`}
        </div>

        {/* Share button */}
        <div className="px-5 pb-5">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-[var(--tile-green)] hover:opacity-90 transition-opacity text-white font-bold py-2.5 rounded-lg text-sm"
          >
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>
    </dialog>
  );
}
