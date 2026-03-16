import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship

from constants import GameStatus


class Base(DeclarativeBase):
    pass


class Game(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    word_length = Column(Integer, nullable=False)
    target_word = Column(String, nullable=False)
    status = Column(String, nullable=False, default=GameStatus.IN_PROGRESS)
    created_at = Column(DateTime, default=datetime.utcnow)

    guesses = relationship(
        "Guess",
        back_populates="game",
        order_by="Guess.created_at",
    )


class Guess(Base):
    __tablename__ = "guesses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    guess_text = Column(String, nullable=False)
    # Stored as list of {"letter": str, "result": "green"|"yellow"|"gray"}
    feedback = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="guesses")
