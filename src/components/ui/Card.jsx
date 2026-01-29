import React from "react";

export default function Card({
  children,
  className = "",
  padded = true,
  hover = true,
}) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm",
        hover ? "transition hover:shadow-md hover:-translate-y-px" : "",
        padded ? "p-5" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
