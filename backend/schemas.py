from typing import Literal, Optional
from pydantic import BaseModel, field_validator


class CreateGameRequest(BaseModel):
    word_length: int

    @field_validator("word_length")
    @classmethod
    def validate_word_length(cls, v: int) -> int:
        if not 5 <= v <= 8:
            raise ValueError("word_length must be between 5 and 8")
        return v


class GameCreateResponse(BaseModel):
    game_id: str
    word_length: int
    max_guesses: int
    status: str


class SubmitGuessRequest(BaseModel):
    guess: str


class TileFeedback(BaseModel):
    letter: str
    result: Literal["green", "yellow", "gray"]


class GuessRecord(BaseModel):
    guess: str
    feedback: list[TileFeedback]


class GameStateResponse(BaseModel):
    game_id: str
    word_length: int
    max_guesses: int
    guesses_remaining: int
    status: str
    guesses: list[GuessRecord]
    word: Optional[str] = None  # revealed only when status is "won" or "lost"


class GuessResponse(BaseModel):
    feedback: list[TileFeedback]
    status: str
    guesses_remaining: int
    word: Optional[str] = None  # revealed only when status is "won" or "lost"
