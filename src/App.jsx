// src/App.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landing/Landing.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";

import Shortlist from "./pages/recommendations/Shortlist.jsx";
import LockUniversity from "./pages/recommendations/LockUniversity.jsx";

// Wrappers (we’ll add these files below)
import DecisionExplanation from "./pages/recommendations/DecisionExplanation.jsx";
import UniversityCardDemo from "./pages/recommendations/UniversityCard.jsx";
import CourseCardDemo from "./pages/recommendations/CourseCard.jsx";

import AuthModal from "./pages/auth/AuthModal.jsx";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onLogin={() => setAuthOpen(true)} />} />

        {/* Mandatory onboarding route */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboard (it already redirects to onboarding internally if incomplete) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Recommendations flow */}
        <Route path="/shortlist" element={<Shortlist />} />
        <Route path="/lock" element={<LockUniversity />} />

        {/* Explanation + demo routes */}
        <Route path="/decision/:universityId" element={<DecisionExplanation />} />
        <Route path="/demo/university-card" element={<UniversityCardDemo />} />
        <Route path="/demo/course-card" element={<CourseCardDemo />} />

        {/* convenience */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
