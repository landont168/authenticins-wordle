# Wordle — Codebase Reference

## Project Structure

```
authenticins-wordle/
├── backend/
│   ├── main.py                          # FastAPI app, CORS config
│   ├── models.py                        # SQLAlchemy ORM models
│   ├── schemas.py                       # Pydantic request/response schemas
│   ├── database.py                      # SQLAlchemy session setup
│   ├── game_logic.py                    # Pure game logic (feedback algorithm)
│   ├── words.py                         # Word lists & validation
│   ├── routers/games.py                 # API route handlers
│   ├── alembic/                         # DB migrations
│   ├── data/wordle.db                   # SQLite database
│   ├── Dockerfile
│   └── startup.sh                       # Runs migrations then starts server
├── frontend/
│   └── src/
│       ├── App.tsx                      # Router setup
│       ├── main.tsx                     # React entry point
│       ├── index.css                    # Global styles + animations
│       ├── api/client.ts                # Fetch-based API client
│       ├── pages/
│       │   ├── SetupPage.tsx            # Landing/home page
│       │   └── GamePage.tsx             # Main game UI (GamePage + GameView)
│       ├── components/
│       │   ├── GameBoard.tsx            # Board grid
│       │   ├── Tile.tsx                 # Individual letter tile
│       │   ├── Keyboard.tsx             # On-screen QWERTY keyboard
│       │   ├── GameOverModal.tsx        # Win/loss popup with share
│       │   ├── HowToPlayModal.tsx       # First-visit tutorial modal
│       │   └── ui/                      # Shared UI primitives (Button, Select)
│       ├── hooks/
│       │   ├── useGame.ts               # Single game state + input handling
│       │   ├── useGameSession.ts        # Multi-mode session (per word length)
│       │   └── useCreateGame.ts         # Game creation mutation
│       └── lib/
│           ├── gameStorage.ts           # localStorage helpers
│           ├── gameUtils.ts             # Letter statuses, flip duration
│           ├── schemas.ts               # Zod schemas + TypeScript types
│           └── utils.ts                 # cn() utility
└── docker-compose.yml
```

---

## Backend

### Database Models (`models.py`)

**Game**
| Field | Type | Notes |
|---|---|---|
| id | String PK | UUID |
| word_length | Integer | 5–8 |
| target_word | String | Uppercase, chosen at creation |
| status | String | `in_progress`, `won`, `lost` |
| created_at | DateTime | Used for stale cleanup |

**Guess**
| Field | Type | Notes |
|---|---|---|
| id | String PK | UUID |
| game_id | FK → Game | |
| guess_text | String | Uppercase |
| feedback | JSON | `[{letter, result}]` where result = `green`/`yellow`/`gray` |

### API Endpoints (`routers/games.py`)

| Method | Path | Description |
|---|---|---|
| POST | `/games` | Create a new game (word_length 5–8) |
| GET | `/games/{game_id}` | Get full game state |
| POST | `/games/{game_id}/guesses` | Submit a guess |

**POST /games** — Picks a random word, returns `game_id`, `word_length`, `max_guesses` (= word_length + 1).

**POST /games/{id}/guesses** — Validates guess length, word validity, no duplicates. Computes feedback, updates status to `won`/`lost` if applicable. Returns `feedback`, `status`, `guesses_remaining`, and `word` (only revealed on game end).

### Game Logic (`game_logic.py`)

**`compute_feedback(guess, answer)`** — Two-pass Wordle algorithm:
1. Pass 1: Mark exact matches (green), remove from pool
2. Pass 2: Check remaining letters against pool (yellow or gray)

Correctly handles duplicate letters (e.g. EERIE vs SPEED).

**`check_win(feedback)`** — All tiles green.

---

## Frontend

### Routing (`App.tsx`)

```
/        → RootRedirect
           ├── Has saved games? → redirect to /game
           └── No games?        → show SetupPage
           └── state.skipRedirect? → always show SetupPage (header nav)
/game    → GamePage
*        → redirect to /
```

### Pages

**SetupPage** — Logo, tagline, "Play Game" button (creates 5-letter game by default), Authentic Insurance branding at bottom.

**GamePage** — Split into two components:
- `GamePage`: Owns session (which game IDs exist, which length is active). Renders `GameView` with `key={activeGameId}` so it remounts cleanly on mode switch.
- `GameView`: Pure UI. Owns modal state, how-to-play state, and delegates input to `useGame`.

### Hooks

**`useGame(gameId)`**
- Fetches game state via react-query (`["game", gameId]`)
- Manages `currentInput`, `shaking`, `revealingRowIndex`
- Persists partial input to `localStorage` (`wordle_input_{gameId}`) — survives mode switches and page refreshes
- Blocks input during submission and flip animation
- Calculates `letterStatuses` from revealed guesses only (keyboard stays hidden during flip)
- Physical keyboard listener wired here

**`useGameSession()`**
- Tracks `gameIds` (one per word length) and `activeLength` in localStorage
- `handleSwitchMode(n)`: switches length, creates game if none exists for that length
- `handleNewGame()`: creates fresh game for current length

**`useCreateGame()`**
- Mutation wrapper around `POST /games`
- On success: saves to localStorage, navigates to `/game`

### Components

**GameBoard** — Renders `maxGuesses` rows × `wordLength` columns. Each row is one of: submitted (with flip animation), current input row (with pop animation), or empty future row.

**Tile** — States: `empty`, `filled`, `green`, `yellow`, `gray`.
- **Pop animation**: fires when `letter` transitions from empty → filled (scale 1 → 1.12 → 1)
- **Flip animation**: fires on reveal row, rotates X-axis, color snaps at 50% rotation via `--target-color` CSS variable
- Flip delay per tile: `colIndex × 300ms`

**Keyboard** — QWERTY layout. Keys colored by letter status (green > yellow > gray priority). Disabled during game over, animation, or submission.

**GameOverModal** — Appears 2 seconds after game ends (only if the game ended during this session — tracked via `wasInProgressRef`). Shows "Congrats! 🎉" or "Nice Try!", a one-line message, and a green Share button that copies the emoji grid to clipboard.

Share format:
```
Wordle (5 letters) 4/6

🟨⬛⬛⬛⬛
🟩🟨⬛⬛⬛
🟩🟩🟩⬛🟩
🟩🟩🟩🟩🟩
```

**HowToPlayModal** — Shown on first visit (localStorage key: `wordle_how_to_play_seen`). Uses native `<dialog>` element.

### State & Storage

| localStorage Key | Value | Purpose |
|---|---|---|
| `wordle_games` | `{5: gameId, 6: gameId, ...}` | Active game IDs per word length |
| `wordle_active_length` | `5`–`8` | Last active mode |
| `wordle_input_{gameId}` | String | In-progress typed input |
| `wordle_how_to_play_seen` | `"1"` | Tutorial shown flag |

---

## Animations (`index.css`)

| Class | Duration | Effect |
|---|---|---|
| `tile-pop` | 0.1s | Scale 1 → 1.12 → 1 on letter input |
| `tile-flip` | 0.5s + delay | X-axis flip, color snap at 50% |
| `row-shake` | 0.5s | ±4px horizontal shake on invalid guess |
| `answer-popup` | 0.25s | Fade + slide up for answer pill |
| `modal-fade-in` | 0.2s | Fade + slide up for game over modal |
| `key-bounce` | 0.1s | Scale 0.95 on key press |

---

## Features

- **Variable word length (5–8)** — Toggle in header; N letters = N+1 guesses. Each length maintains its own independent game.
- **Input persistence** — Typed letters survive mode switches and page refreshes.
- **Tile flip animation** — Staggered per column, color revealed mid-flip.
- **Tile pop animation** — Bounce + border darkens on each keystroke.
- **Keyboard feedback** — Keys reflect highest-priority status seen so far; only updates after full row reveal.
- **Game over modal** — Fades in 2s after game ends, only on fresh completion (not on revisit).
- **Answer pill** — Floating pill shows the answer after game ends (win or loss).
- **Share button** — Copies emoji grid to clipboard.
- **Header navigation** — Click "Wordle" to return to home without being redirected back.
- **How to Play** — First-visit modal explaining rules and tile colours.
- **Gilroy font** — Custom font via `@font-face` (Light + ExtraBold weights).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, SQLite, Alembic |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, custom CSS animations |
| State | TanStack React Query + localStorage |
| Validation | Pydantic (backend), Zod (frontend) |
| Font | Gilroy (Light 300, ExtraBold 800) |
| Container | Docker, Docker Compose |
