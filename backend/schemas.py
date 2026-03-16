from typing import Optional
from pydantic import BaseModel, field_validator

from constants import GameStatus, MIN_WORD_LENGTH, MAX_WORD_LENGTH


class CreateGameRequest(BaseModel):
    word_length: int

    @field_validator("word_length")
    @classmethod
    def validate_word_length(cls, v: int) -> int:
        if not MIN_WORD_LENGTH <= v <= MAX_WORD_LENGTH:
            raise ValueError(
                f"word_length must be between {MIN_WORD_LENGTH} and {MAX_WORD_LENGTH}"
            )
        return v


class SubmitGuessRequest(BaseModel):
    guess: str


class TileFeedback(BaseModel):
    letter: str
    result: str


class GuessRecord(BaseModel):
    guess: str
    feedback: list[TileFeedback]


class GameCreateResponse(BaseModel):
    game_id: str
    word_length: int
    max_guesses: int
    status: GameStatus


class GameStateResponse(BaseModel):
    game_id: str
    word_length: int
    max_guesses: int
    guesses_remaining: int
    status: GameStatus
    guesses: list[GuessRecord]
    word: Optional[str] = None  # revealed only when status is won or lost


class GuessResponse(BaseModel):
    feedback: list[TileFeedback]
    status: GameStatus
    guesses_remaining: int
    word: Optional[str] = None  # revealed only when status is won or lost
