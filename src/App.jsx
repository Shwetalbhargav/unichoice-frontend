// src/App.jsx
import { useEffect, useState } from "react";
import LandingPage from "./pages/landing/Landing.jsx";
import AuthModal from "./pages/auth/AuthModal.jsx";
import useAuthStore from "./store/authStore";
import "./App.css";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe().catch(() => {});
  }, [token, fetchMe]);

  return (
    <>
      <LandingPage onLogin={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
