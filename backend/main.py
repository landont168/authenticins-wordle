from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.games import router as games_router

app = FastAPI(title="Wordle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games_router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
