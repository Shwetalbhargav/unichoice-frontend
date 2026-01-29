import React from "react";

const variants = {
  info: "bg-sky-100 text-sky-700 border-sky-200/60",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200/60",
  warning: "bg-amber-100 text-amber-800 border-amber-200/60",
  danger: "bg-rose-100 text-rose-700 border-rose-200/60",
  neutral: "bg-slate-100 text-slate-700 border-slate-200/60",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
