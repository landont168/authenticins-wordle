"""
Pure game logic functions — no database or routing dependencies.
These can be tested independently.
"""

from typing import Literal

Feedback = Literal["green", "yellow", "gray"]


def compute_feedback(guess: str, answer: str) -> list[Feedback]:
    """
    Two-pass Wordle feedback algorithm.

    Pass 1: Mark exact matches (green) and remove those letters from the pool.
    Pass 2: For remaining positions, check if the letter exists in the pool (yellow)
            or not (gray). Remove matched letters from pool to avoid double-counting.

    Example — Answer: SPEED, Guess: EERIE
        Pass 1: no greens (no position matches)
        Pass 2: first E→yellow, second E→yellow, R→gray, I→gray, third E→gray
        Result: yellow, yellow, gray, gray, gray
    """
    guess = guess.upper()
    answer = answer.upper()

    result: list[Feedback] = ["gray"] * len(guess)
    # Mutable pool; index positions marked None when consumed
    answer_pool: list[str | None] = list(answer)

    # Pass 1 — greens
    for i in range(len(guess)):
        if guess[i] == answer[i]:
            result[i] = "green"
            answer_pool[i] = None

    # Pass 2 — yellows
    for i in range(len(guess)):
        if result[i] == "green":
            continue
        letter = guess[i]
        for j in range(len(answer_pool)):
            if answer_pool[j] == letter:
                result[i] = "yellow"
                answer_pool[j] = None
                break
        # if not found, stays "gray"

    return result


def check_win(feedback: list[Feedback]) -> bool:
    """Return True if all tiles are green (correct guess)."""
    return all(f == "green" for f in feedback)


def check_loss(guess_count: int, max_guesses: int) -> bool:
    """Return True if the player has used all their guesses without winning."""
    return guess_count >= max_guesses
