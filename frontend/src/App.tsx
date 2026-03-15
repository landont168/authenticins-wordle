import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SetupPage } from "./pages/SetupPage";
import { GamePage } from "./pages/GamePage";

function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedGameId = localStorage.getItem("game_id");
    if (savedGameId) {
      navigate(`/game/${savedGameId}`, { replace: true });
    }
  }, [navigate]);

  return <SetupPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/game/:id" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
