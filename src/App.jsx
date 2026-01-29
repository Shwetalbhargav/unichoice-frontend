// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landing/Landing.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";


import AuthModal from "./pages/auth/AuthModal.jsx";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onLogin={() => setAuthOpen(true)} />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* later: dashboard route */}
      </Routes>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
