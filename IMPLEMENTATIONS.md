# Wordle Full Stack Assessment

## Background

Wordle is a simple game in which you have to guess a five-letter word. You get six guesses, learning a little more information with each guess, and eventually narrow your guesses down to find the answer.

You can play an online version of Wordle [here](https://www.nytimes.com/games/wordle/index.html).

## Rules

1. Letters that are in the answer and in the right place turn green.
2. Letters that are in the answer but in the wrong place turn yellow.
3. Letters that are not in the answer turn gray.
4. Answers are never plural.
5. Letters can appear more than once. So if your guess includes two of one letter, they may both turn yellow, both turn green, or one could be yellow and the other green.
6. Each guess must be a valid word in Wordle's dictionary. You can't guess ABCDE, for instance.
7. You do not have to include correct letters in subsequent guesses.
8. You have six guesses to solve the Wordle.

## Goal

Your goal is to design and build a full stack Wordle application with both a REST API backend and a React frontend.

In our version of Wordle, there are 2 key differences from the original:

1. **Multiple Games**: The user can create and play as many games as they want.
2. **Configurable Word Length**: The user can configure the number of letters in the target word to be anywhere between 5 to 8 letters, but they will always only have N+1 turns to guess the word. For instance, traditional Wordle involves guessing a five-letter word over six turns, but in our version, the user can pick 7 as the number of letters and get 8 turns to guess the word.

### Backend Requirements

- Build a REST API that supports:
  - Creating a new game (with configurable word length 5-8)
  - Submitting guesses and receiving feedback (green/yellow/gray for each letter)
  - Retrieving game state
  - Validating that guesses are real words
- Use appropriate data storage for game state

### Frontend Requirements

- Build a React UI that allows users to:
  - Start a new game with a selected word length (5-8 letters)
  - Enter guesses via an on-screen keyboard or physical keyboard
  - See feedback for each guess (green/yellow/gray letters)
  - View their guess history for the current game
  - See when they've won or lost

**Use of AI is allowed and encouraged for this assessment.**

---

## Getting Started

This repository includes boilerplate code to help you get started quickly.

### Project Structure

```
wordle-starter/
├── frontend/           # React application (Vite)
├── backend/            # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Frontend

The frontend is a React application built with Vite. It is pre-configured with CORS support to communicate with the backend.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

**Key files to modify:**

- `frontend/src/App.jsx` - Main application component, start building your UI here
- `frontend/src/App.css` - Application styles
- Add new components in `frontend/src/components/` as needed

### Backend

The backend is a FastAPI application with CORS already configured for the frontend. Run it using Docker Compose:

```bash
docker compose up --build
```

This will build and start the backend container with hot-reloading enabled. The API will be available at `http://localhost:8000`.

To run in detached mode (background):

```bash
docker compose up -d --build
```

To stop the container:

```bash
docker compose down
```

API documentation is automatically available at `http://localhost:8000/docs`.

**Key files to modify:**

- `backend/main.py` - Add your API endpoints here
- `backend/requirements.txt` - Add any additional Python dependencies

### Development Workflow

1. Start the backend with `docker compose up --build`
2. Start the frontend with `cd frontend && npm install && npm run dev`
3. Build your API endpoints in `backend/main.py`
4. Build your UI in the `frontend/src/` directory
5. The frontend is configured to make requests to `http://localhost:8000`

---

Here's a full-stack Wordle assessment spec. Build it end-to-end.

1. FastAPI backend with endpoints for creating games, submitting guesses (with green/yellow/gray feedback), and retrieving game state.

**Endpoints**

```
POST   /games                    → create a new game
GET    /games                    → list all games
GET    /games/{game_id}          → get full game state
POST   /games/{game_id}/guesses  → submit a guess
Behavior
```

- `POST /games` accepts { "word_length": 6 } (valid range: 5–8). Returns game_id, word_length, max_guesses (word_length + 1), status: "in_progress". Pick a random target word of the correct length from a bundled word list — do not call any external API.
- `POST /games/{game_id}/guesses` accepts { "guess": "crane" }. Validates the guess is a real word (check against word list), runs the feedback algorithm, updates game state, returns feedback array and updated status.
- `GET /games/{game_id}` returns full game state — all previous guesses with their feedback, guesses remaining, status. Never expose the target word unless status is "won" or "lost".
- Return proper HTTP codes: 201 on game creation, 404 for missing game, 400 with descriptive messages for invalid guesses ("Not a valid word", "Not enough letters", "Game is already over").

Why the two-pass matters — concrete example:
Answer: SPEED, Guess: EERIE
The answer has two E's. The guess has three E's.

Pass 1: no greens (no position matches)
Pass 2, working through E, E, R, I, E against pool [S,P,E,E,D]:

First E → yellow, pool becomes [S,P,E,D]
Second E → yellow, pool becomes [S,P,D]
R → gray
I → gray
Third E → gray (pool has no E left)

Result: 🟨🟨⬜⬜⬜

Wordle Feedback Algo:
Pass 1 — find all greens first:
Go through each position. If guess[i] == answer[i], mark green and remove that letter from the answer pool.
Pass 2 — find yellows and grays:
For every non-green position, check if the guessed letter exists in the remaining answer pool. If yes → yellow, remove it from pool. If no → gray.

**2. Frontend**
React frontend with a working keyboard (physical + on-screen), colored tile feedback, and a word length selector (5-8). Use the existing project structure in the repo. Start with the backend, then the frontend.

**Game Flow**

- On load, check localStorage for a saved game_id. If found, call GET /games/{game_id} to rehydrate state. If not found, show a new game setup screen.
- Also reflect the active game_id in the URL (e.g. /game/abc123) so games are bookmarkable. On load, check URL first, then fall back to localStorage.
- New game setup screen lets the user pick word length (5–8) via a selector, then calls POST /games.

**Game Board**

- Display a grid of tiles: max_guesses rows × word_length columns.
- Completed rows show colored tiles: green/yellow/gray per the feedback.
- Current row shows letters as the user types.
- Empty rows are blank placeholder tiles.

**Keyboard**

- On-screen keyboard (QWERTY layout) plus support for physical keyboard input.
- Keys update their color to reflect the best result seen so far for that letter (green > yellow > gray). This is the actual Wordle feel — don't skip it.

**Animations & Polish**

- Tile flip animation when a guess is revealed.
- Shake animation on the current row when an invalid word is submitted.
- Toast notifications for errors ("Not a valid word", "Not enough letters") and win/loss messages.

**Win / Loss**

- On win: show a congratulations toast, disable input.
- On loss: show the target word, disable input.
- Show a "New Game" button that clears localStorage/URL and returns to the setup screen.

**General**

- Keep game logic (feedback algorithm, win/loss detection) in its own module/file, separate from route handlers.
- Use the existing project structure: backend/main.py, frontend/src/App.jsx, add components in frontend/src/components/.
- Bundle a word list — find a public domain English word list (e.g. Wordle's original 2,500 word list is public). Do not call an external API for word validation.

Start with the backend. After implementing each endpoint, show a sample curl command to test it. Then move to the frontend.

**Tech Stack**
**Backend**

- FastAPI for the REST API
- SQLite via SQLAlchemy for persistence — do not use Postgres or in-memory storage. SQLite is the right tool for a single-player toy app with no concurrency concerns.
- Alembic for database migrations
- Pydantic models for all request/response schemas — keep these strictly separate from SQLAlchemy DB models

**Frontend**

- React + TypeScript
- React Router for /game/:id URL pattern
- TanStack Query for all data fetching, caching, and server state
- Zod for runtime validation of API responses
- Tailwind CSS/Shadcn for componenets and styling

**Features**

- User should be able to play as many games as possible (maybe a new game button somewhere at the top)
- user should be able to configure to play with a word of 5-8 letters (maybe through some slider feature modal pop up)

**Key design principles to follow**

- All TanStack Query calls and game state logic should live in a useGame custom hook — components should be purely presentational
- All API calls should go through typed functions in api/ — no raw fetch calls in components or hooks
- Game logic (feedback algorithm, win/loss detection) must be pure functions in game_logic.py with no database or routing dependencies — this makes it independently testable

Let me know if you have any questions on technical or product requirements, or clarifying questions.
