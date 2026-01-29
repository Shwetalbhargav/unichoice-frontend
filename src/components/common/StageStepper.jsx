import React from "react";
import { FiCheck } from "react-icons/fi";

const defaultStages = [
  { key: "profile", label: "Academic Background" },
  { key: "goals", label: "Career Goals" },
  { key: "budget", label: "Budget & Preferences" },
];

export default function StageStepper({
  stages = defaultStages,
  activeIndex = 0,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        {stages.map((s, idx) => {
          const isActive = idx === activeIndex;
          const isDone = idx < activeIndex;

          return (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-2xl border text-sm font-bold",
                    isDone
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : isActive
                      ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                      : "bg-white/60 text-slate-500 border-slate-200/60",
                  ].join(" ")}
                >
                  {isDone ? <FiCheck /> : idx + 1}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={[
                      "text-sm font-bold",
                      isActive ? "text-slate-900" : "text-slate-600",
                    ].join(" ")}
                  >
                    {s.label}
                  </p>
                </div>
              </div>

              {idx !== stages.length - 1 ? (
                <div className="h-0.5 flex-1 rounded-full bg-slate-200/70" />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
