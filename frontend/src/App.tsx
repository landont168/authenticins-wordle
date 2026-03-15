import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SetupPage } from "./pages/SetupPage";
import { GamePage } from "./pages/GamePage";

function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("wordle_games");
    const hasGame = raw && Object.keys(JSON.parse(raw)).length > 0;
    if (hasGame) {
      navigate("/game", { replace: true });
    }
  }, [navigate]);

  return <SetupPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
