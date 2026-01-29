import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function SuccessStats({ stats, Badge, Card, FadeIn, SlideUp }) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <div className="text-center">
            <Badge variant="neutral">⭐ Our Success in Numbers</Badge>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
              Trusted by students across India
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Outcomes that stay consistent — because the process is structured.
            </p>
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {stats.map((s, idx) => (
            <SlideUp key={s.label} delay={idx * 0.06}>
              <Card className="text-center">
                <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{s.label}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                  <FiCheckCircle />
                  Verified performance
                </div>
              </Card>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}
