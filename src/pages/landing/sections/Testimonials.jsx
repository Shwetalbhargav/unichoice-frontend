import React from "react";

export default function Testimonials({ items, Badge, Card, FadeIn, SlideUp }) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <div className="text-center">
            <Badge variant="success">💬 Testimonials</Badge>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
              Students felt the difference
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Because the counsellor guides decisions — not just chat.
            </p>
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((t, idx) => (
            <SlideUp key={t.name} delay={idx * 0.06}>
              <Card>
                <div className="flex items-center gap-3">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-11 w-11 rounded-2xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{t.tag}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                  “{t.quote}”
                </p>
              </Card>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  );
}
