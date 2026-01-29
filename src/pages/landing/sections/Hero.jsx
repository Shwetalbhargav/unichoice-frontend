import React from "react";

export default function Hero({
  logo,
  heroAssistant,
  activeStep,
  setActiveStep,
  onLogin,
  StageStepper,
  Badge,
  Button,
  Card,
  FadeIn,
  SlideUp,
}) {
  return (
    <section className="px-4 pt-10 md:pt-14 min-h-[calc(100vh-80px)] flex items-center">
      <div className="mx-auto max-w-6xl w-full">
        <div className="grid items-center gap-8 md:grid-cols-2 w-full">
          <SlideUp>
            <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Badge variant="info" className="mb-4">
                  ✨ Personalized AI guidance
                </Badge>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                Plan Your Study Abroad <br className="hidden md:block" />
                Journey with Confidence
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
                Get personalized AI guidance to find and secure your perfect
                university — with a structured, stage-based counsellor.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Button onClick={() => setActiveStep(0)} withArrow>
                  Get Started
                </Button>
                <Button variant="secondary" onClick={onLogin}>
                  Login
                </Button>
              </div>

              <div className="mt-8">
                <Card className="bg-white/60">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      Your journey in 3 steps
                    </p>
                    <button
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      onClick={() => setActiveStep((p) => (p + 1) % 3)}
                    >
                      Next step →
                    </button>
                  </div>
                  <StageStepper activeIndex={activeStep} />
                </Card>
              </div>
            </div>
          </SlideUp>

          <FadeIn>
            <div className="relative max-w-xl mx-auto md:mx-0">
              {/* FIXED: rounded-4xl is not a default Tailwind class */}
              <div className="absolute -inset-2 -z-10 rounded-[32px] bg-white/60 blur-xl" />

              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt="AI Counsellor"
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                    <p className="text-sm font-extrabold text-slate-900">
                      AI Counsellor
                    </p>
                  </div>
                  <Badge variant="success" className="hidden sm:inline-flex">
                    Live guidance
                  </Badge>
                </div>

                <div className="px-5 pb-5">
                  <img
                    src={heroAssistant}
                    alt="AI Assistant"
                    className="w-full max-w-full rounded-3xl object-contain md:object-cover"
                  />

                  <div className="mt-4 grid gap-2">
                    <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        Welcome! Let’s build your profile.
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        I’ll guide you through each step ✨
                      </p>
                    </div>

                    <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        What’s your current education level?
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["Bachelor’s", "Master’s", "Diploma"].map((t) => (
                          <button
                            key={t}
                            className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-3xl bg-slate-50/80 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-600">
                      Ready to start?
                    </p>
                    <Button size="sm" withArrow onClick={() => setActiveStep(0)}>
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
