import React from "react";
import { FiArrowRight, FiLoader } from "react-icons/fi";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400 shadow-sm",
  secondary:
    "bg-white/80 text-slate-900 hover:bg-white border border-slate-200/70 focus-visible:ring-slate-300 shadow-sm backdrop-blur",
  ghost:
    "bg-transparent text-slate-800 hover:bg-slate-100/70 focus-visible:ring-slate-300",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-400 shadow-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  rightIcon,
  leftIcon,
  withArrow = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <FiLoader className="animate-spin" /> : leftIcon}
      <span>{children}</span>
      {rightIcon ? rightIcon : withArrow ? <FiArrowRight /> : null}
    </button>
  );
}
