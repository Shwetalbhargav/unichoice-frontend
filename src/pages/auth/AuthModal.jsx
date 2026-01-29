// src/features/auth/AuthModal.jsx
import { useState } from "react";
import { Modal } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({ open, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // login | register
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    onLoginSuccess?.();     // close modal / any parent side-effects
    navigate("/onboarding", { replace: true }); // ✅ redirect
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back 👋" : "Create your account ✨"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "login"
              ? "Login to continue your study abroad journey"
              : "Start your guided study abroad journey"}
          </p>
        </div>
      }
    >
      <div className="mt-6">
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("register")} onSuccess={handleLoginSuccess} />
        ) : (
          <RegisterForm onSwitch={() => setMode("login")} onSuccess={onClose} />
        )}
      </div>
    </Modal>
  );
}
