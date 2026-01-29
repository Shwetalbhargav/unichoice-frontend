import React from "react";

export default function WhyStudyAbroad({ students, cards, Card, FadeIn, SlideUp }) {
  return (
    <section id="why" className="scroll-mt-24 py-16 md:py-24 bg-white/20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl text-center md:text-left">
            Why Indian Students <br className="hidden md:block" />
            Should Study Abroad?
          </h2>
        </FadeIn>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SlideUp>
            <Card className="p-0 overflow-hidden">
              <img
                src={students?.[2]}
                alt="Students"
                className="h-64 w-full object-cover md:h-full"
              />
            </Card>
          </SlideUp>

          <div className="grid gap-4">
            {cards.map((c, idx) => (
              <SlideUp key={c.title} delay={idx * 0.05}>
                <Card className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
                  </div>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
