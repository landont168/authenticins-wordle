import random
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from constants import GameStatus
from database import get_db
from game_logic import check_win, compute_feedback, max_guesses_for_length
from models import Game, Guess
from schemas import (
    CreateGameRequest,
    GameCreateResponse,
    GameStateResponse,
    GuessRecord,
    GuessResponse,
    SubmitGuessRequest,
    TileFeedback,
)
from words import get_words_for_length, is_valid_word

router = APIRouter(prefix="/games", tags=["games"])


@router.post("", status_code=201, response_model=GameCreateResponse)
def create_game(request: CreateGameRequest, db: Session = Depends(get_db)):
    words = get_words_for_length(request.word_length)
    if not words:
        raise HTTPException(
            status_code=400,
            detail=f"No words available for length {request.word_length}",
        )

    target_word = random.choice(words)
    game = Game(
        id=str(uuid.uuid4()),
        word_length=request.word_length,
        target_word=target_word.upper(),
        status=GameStatus.IN_PROGRESS,
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    return GameCreateResponse(
        game_id=game.id,
        word_length=game.word_length,
        max_guesses=max_guesses_for_length(game.word_length),
        status=GameStatus.IN_PROGRESS,
    )


@router.get("/{game_id}", response_model=GameStateResponse)
def get_game(game_id: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    max_guesses = max_guesses_for_length(game.word_length)
    guess_records = [
        GuessRecord(
            guess=g.guess_text,
            feedback=[
                TileFeedback(letter=fb["letter"], result=fb["result"])
                for fb in g.feedback
            ],
        )
        for g in game.guesses
    ]

    return GameStateResponse(
        game_id=game.id,
        word_length=game.word_length,
        max_guesses=max_guesses,
        guesses_remaining=max_guesses - len(game.guesses),
        status=game.status,
        guesses=guess_records,
        word=game.target_word if game.status in (GameStatus.WON, GameStatus.LOST) else None,
    )


@router.post("/{game_id}/guesses", response_model=GuessResponse)
def submit_guess(
    game_id: str,
    request: SubmitGuessRequest,
    db: Session = Depends(get_db),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Game is already over")

    guess = request.guess.strip().upper()

    if len(guess) < game.word_length:
        raise HTTPException(status_code=400, detail="Not enough letters")

    if len(guess) != game.word_length:
        raise HTTPException(
            status_code=400,
            detail=f"Guess must be exactly {game.word_length} letters",
        )

    if not is_valid_word(guess, game.word_length):
        raise HTTPException(status_code=400, detail="Not a valid word")

    already_guessed = (
        db.query(Guess)
        .filter(Guess.game_id == game_id, Guess.guess_text == guess)
        .first()
    )
    if already_guessed:
        raise HTTPException(status_code=400, detail="Already guessed that word")

    existing_count = len(game.guesses)  # use already-loaded relationship
    max_guesses = max_guesses_for_length(game.word_length)

    feedback_results = compute_feedback(guess, game.target_word)
    feedback_data = [
        {"letter": letter, "result": result}
        for letter, result in zip(guess, feedback_results)
    ]

    db.add(
        Guess(
            id=str(uuid.uuid4()),
            game_id=game.id,
            guess_text=guess,
            feedback=feedback_data,
        )
    )

    new_count = existing_count + 1
    if check_win(feedback_results):
        game.status = GameStatus.WON
    elif new_count >= max_guesses:
        game.status = GameStatus.LOST

    db.commit()

    return GuessResponse(
        feedback=[
            TileFeedback(letter=fb["letter"], result=fb["result"])
            for fb in feedback_data
        ],
        status=game.status,
        guesses_remaining=max(0, max_guesses - new_count),
        word=game.target_word if game.status in (GameStatus.WON, GameStatus.LOST) else None,
    )
