import React, { useMemo, useState } from "react";

// Prefer barrel imports if you have them
import { Navbar, Footer, StageStepper } from "../../components/common";
import { Badge, Button, Card, Input, Modal } from "../../components/ui";
import { FadeIn, SlideUp } from "../../components/animations";

// Icons
import { FiMail, FiLock } from "react-icons/fi";

// Assets (same as your original)
import logo from "../../assets/images/logo.jpg";
import heroAssistant from "../../assets/images/ai-assistant.png";
import student1 from "../../assets/images/student-1.jpg";
import student2 from "../../assets/images/student-2.jpg";
import student3 from "../../assets/images/student-3.jpg";
import student4 from "../../assets/images/student-4.jpg";




// Sections
import Hero from "./sections/Hero";
import WhyStudyAbroad from "./sections/WhyStudyAbroad";
import SuccessStats from "./sections/SuccessStats";
import HowItWorks from "./sections/HowItWorks";
import Testimonials from "./sections/Testimonials";
import CTA from "./sections/CTA";

export default function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const students = useMemo(() => [student1, student2, student3, student4], []);

  // Data moved out of JSX (still local, but cleaner)
  const whyCards = [
    {
      title: "Gain global job opportunities",
      desc: "International exposure improves career outcomes and networks.",
      icon: "🌍",
    },
    {
      title: "Experience world-class education",
      desc: "Learn from top faculty, labs, and industry-aligned programs.",
      icon: "🎓",
    },
    {
      title: "Immerse yourself in new cultures",
      desc: "Build confidence, independence, and global perspective.",
      icon: "🧭",
    },
  ];

  const stats = [
    { value: "95%", label: "Visa Success Rate" },
    { value: "5,000+", label: "Students Guided" },
    { value: "1,200+", label: "Top University Partners" },
  ];

  const steps = [
    {
      title: "Profile Building",
      desc: "Tell us about your background and aspirations.",
      img: student1,
    },
    {
      title: "Get AI Recommendations",
      desc: "Receive personalized university & course suggestions.",
      img: student3,
    },
    {
      title: "Lock Your Decision",
      desc: "Shortlist, lock, and finalize your application.",
      img: heroAssistant,
    },
  ];

  const testimonials = [
    {
      name: "Aarav, Mumbai",
      quote:
        "The stage-based flow made it super clear what to do next. No more random guessing.",
      img: student2,
      tag: "Target shortlist",
    },
    {
      name: "Priya, Bengaluru",
      quote:
        "I finally understood where my profile was weak — and what to fix first.",
      img: student4,
      tag: "Profile gaps",
    },
    {
      name: "Rohan, Delhi",
      quote:
        "Locking a university forced me to commit. After that, everything felt focused.",
      img: student1,
      tag: "Decision lock",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-slate-900">
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-95 w-170 -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-24 -right-30 h-85 w-85 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-30 -left-30 h-90 w-90 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <Navbar
        onLogin={() => setLoginOpen(true)}
        onGetStarted={() => setActiveStep(0)}
      />

      {/* LOGIN MODAL kept in Landing as app-level UI */}
      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Login to AI Counsellor"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLoginOpen(false)}>
              Cancel
            </Button>
            <Button withArrow onClick={() => setLoginOpen(false)}>
              Login
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <Input label="Email" placeholder="Enter your email" leftIcon={<FiMail />} />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftIcon={<FiLock />}
          />
          <div className="flex items-center justify-between pt-1">
            <button className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              Forgot password?
            </button>
            <button className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              Sign up
            </button>
          </div>
        </div>
      </Modal>

      <Hero
        logo={logo}
        heroAssistant={heroAssistant}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onLogin={() => setLoginOpen(true)}
        StageStepper={StageStepper}
        // Pass in UI components to keep Hero “pure” if you want; optional:
        Badge={Badge}
        Button={Button}
        Card={Card}
        FadeIn={FadeIn}
        SlideUp={SlideUp}
      />

      <WhyStudyAbroad
        students={students}
        cards={whyCards}
        Card={Card}
        FadeIn={FadeIn}
        SlideUp={SlideUp}
      />

      <SuccessStats stats={stats} Badge={Badge} Card={Card} FadeIn={FadeIn} SlideUp={SlideUp} />

      <HowItWorks steps={steps} Badge={Badge} Card={Card} FadeIn={FadeIn} SlideUp={SlideUp} />

      <Testimonials
        items={testimonials}
        Badge={Badge}
        Card={Card}
        FadeIn={FadeIn}
        SlideUp={SlideUp}
      />

      <CTA
        onStart={() => setActiveStep(0)}
        onLogin={() => setLoginOpen(true)}
        Button={Button}
        Card={Card}
        SlideUp={SlideUp}
      />

      <Footer />
    </div>
  );
}
