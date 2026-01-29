import React from "react";
import { FiInstagram, FiLinkedin, FiTwitter } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/40 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.jpg"
              alt="AI Counsellor"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="text-sm font-extrabold text-slate-900">
              AI Counsellor
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Guided, stage-based study abroad decisions — clarity over chaos.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-bold text-slate-900">Quick links</p>
          <div className="mt-3 grid gap-2 text-slate-700">
            <a href="#why" className="hover:text-slate-900">
              Why Study Abroad
            </a>
            <a href="#process" className="hover:text-slate-900">
              Our Process
            </a>
            <a href="#stories" className="hover:text-slate-900">
              Success Stories
            </a>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-bold text-slate-900">Social</p>
          <div className="mt-3 flex items-center gap-3 text-slate-700">
            <a className="rounded-xl p-2 hover:bg-slate-100/70" href="#">
              <FiLinkedin />
            </a>
            <a className="rounded-xl p-2 hover:bg-slate-100/70" href="#">
              <FiTwitter />
            </a>
            <a className="rounded-xl p-2 hover:bg-slate-100/70" href="#">
              <FiInstagram />
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} AI Counsellor
          </p>
        </div>
      </div>
    </footer>
  );
}
