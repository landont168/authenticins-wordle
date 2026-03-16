from enum import Enum

MIN_WORD_LENGTH = 5
MAX_WORD_LENGTH = 8


class GameStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    WON = "won"
    LOST = "lost"
