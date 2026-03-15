import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { SetupPage } from "./pages/SetupPage";
import { GamePage } from "./pages/GamePage";
import { loadGameIds } from "./lib/gameStorage";

function RootRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.skipRedirect) return;
    const hasGame = Object.keys(loadGameIds()).length > 0;
    if (hasGame) {
      navigate("/game", { replace: true });
    }
  }, [navigate, location.state]);

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
