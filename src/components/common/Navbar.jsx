import React from "react";
import Button from "../ui/Button";
import { FiLogIn } from "react-icons/fi";
import logo from "../../assets/images/logo.jpg";

export default function Navbar({ onLogin, onGetStarted }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="AI Counsellor"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="text-sm font-extrabold text-slate-900">
            AI Counsellor
          </span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
          <a className="hover:text-slate-900" href="#why">
            Why Study Abroad?
          </a>
          <a className="hover:text-slate-900" href="#stories">
            Success Stories
          </a>
          <a className="hover:text-slate-900" href="#process">
            Our Process
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onLogin} leftIcon={<FiLogIn />}>
            Login
          </Button>
          <Button onClick={onGetStarted}>Get Started</Button>
        </div>
      </div>
    </header>
  );
}
