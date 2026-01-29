import React from "react";
import { FiAlertCircle } from "react-icons/fi";

export default function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label ? (
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          {label}
        </label>
      ) : null}

      <div
        className={[
          "group flex items-center gap-2 rounded-2xl border px-3 py-2",
          "bg-white/70 backdrop-blur shadow-sm transition",
          error
            ? "border-rose-300 focus-within:ring-2 focus-within:ring-rose-200"
            : "border-slate-200/70 focus-within:ring-2 focus-within:ring-slate-200",
          className,
        ].join(" ")}
      >
        {leftIcon ? <span className="text-slate-500">{leftIcon}</span> : null}

        <input
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          {...props}
        />

        {rightIcon ? <span className="text-slate-500">{rightIcon}</span> : null}
      </div>

      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <FiAlertCircle /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
