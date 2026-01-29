import React from "react";
import { FiArrowRight } from "react-icons/fi";

export default function CTA({ onStart, onLogin, Button, Card, SlideUp }) {
  return (
    <section className="py-16 md:py-24 bg-white/20">
      <div className="mx-auto max-w-6xl px-4">
        <SlideUp>
          <Card className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-extrabold text-slate-900">
                Ready to shortlist universities with confidence?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Start onboarding in 3 steps and get your AI-generated shortlist.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onStart} rightIcon={<FiArrowRight />}>
                Start Now
              </Button>
              <Button variant="secondary" onClick={onLogin}>
                Login
              </Button>
            </div>
          </Card>
        </SlideUp>
      </div>
    </section>
  );
}
