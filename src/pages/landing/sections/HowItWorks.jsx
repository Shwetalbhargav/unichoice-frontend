import React from "react";

export default function HowItWorks({ steps, Badge, Card, FadeIn, SlideUp }) {
  return (
    <section id="process" className="scroll-mt-24 py-16 md:py-24 bg-white/20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <div className="text-center">
            <Badge variant="info">📌 Our Process</Badge>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
              How it works (no randomness)
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              A guided flow from profile → shortlist → lock → apply.
            </p>
          </div>
        </FadeIn>

        {/* moved id=stories off inner div to avoid nested anchor weirdness */}
        <div id="stories" className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((st, idx) => (
            <SlideUp key={st.title} delay={idx * 0.06}>
              <Card className="p-0 overflow-hidden">
                <div className="p-5">
                  <p className="text-sm font-extrabold text-slate-900">
                    {idx + 1}. {st.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{st.desc}</p>
                </div>
                <div className="px-5 pb-5">
                  <img
                    src={st.img}
                    alt={st.title}
                    className="h-44 w-full rounded-3xl object-cover"
                  />
                </div>
              </Card>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}
