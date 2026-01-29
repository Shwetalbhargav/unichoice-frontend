// src/features/onboarding/Onboarding.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "../../components/ui";
import { StageStepper } from "../../components/common";
import useOnboardingStore from "../../store/onboardingStore";

import AcademicProfile from "./steps/AcademicProfile";
import CareerGoals from "./steps/CareerGoals";
import BudgetAndCountry from "./steps/BudgetAndCountry";
import Readiness from "./steps/Readiness";
import ReviewAndSubmit from "./steps/ReviewAndSubmit";

const STEPS = [
  { key: "ACADEMICS", title: "Academic Profile" },
  { key: "GOALS", title: "Career Goals" },
  { key: "BUDGET", title: "Budget & Country" },
  { key: "READINESS", title: "Readiness" },
  { key: "REVIEW", title: "Review & Submit" },
];

const DEFAULT_FORM = {
  // Academics
  educationLevel: "",
  fieldOfStudy: "",
  graduationYear: "",

  // Goals (schema)
  targetDegree: "",
  targetIntake: "",

  // Countries (schema)
  preferredCountries: [],

  // Budget (schema)
  budgetRange: "",
  fundingPlan: "",

  // Readiness (schema enums)
  ieltsStatus: "",
  greStatus: "",
  sopStatus: "",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { onboarding, fetchMyOnboarding, save, loading, error } = useOnboardingStore();

  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);

  // Prefill from backend
  useEffect(() => {
    (async () => {
      const existing = await fetchMyOnboarding();

      if (existing) {
        setForm((prev) => ({
          ...prev,
          educationLevel: existing.educationLevel ?? "",
          fieldOfStudy: existing.fieldOfStudy ?? "",
          graduationYear: existing.graduationYear ?? "",

          targetDegree: existing.targetDegree ?? "",
          targetIntake: existing.targetIntake ?? "",

          preferredCountries: Array.isArray(existing.preferredCountries)
            ? existing.preferredCountries
            : [],

          budgetRange: existing.budgetRange ?? "",
          fundingPlan: existing.fundingPlan ?? "",

          ieltsStatus: existing.ieltsStatus ?? "",
          greStatus: existing.greStatus ?? "",
          sopStatus: existing.sopStatus ?? "",
        }));

        // If already completed, skip onboarding
        if (existing?.completedAt) navigate("/dashboard", { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = STEPS[stepIdx];
  const canGoBack = stepIdx > 0;
  const canGoNext = stepIdx < STEPS.length - 1;

  const stepIsValid = useMemo(() => {
    switch (current.key) {
      case "ACADEMICS":
        return Boolean(form.educationLevel && form.fieldOfStudy);
      case "GOALS":
        return Boolean(form.targetDegree && String(form.targetIntake).trim().length);
      case "BUDGET":
        return Boolean(form.preferredCountries?.length > 0 && form.fundingPlan);
      case "READINESS":
      case "REVIEW":
        return true;
      default:
        return false;
    }
  }, [current.key, form]);

  const buildPayload = () => {
    const payload = {
      // Academics
      educationLevel: form.educationLevel || null,
      fieldOfStudy: form.fieldOfStudy || null,
      graduationYear: form.graduationYear ? Number(form.graduationYear) : null,

      // Goals
      targetDegree: form.targetDegree || null,
      targetIntake: form.targetIntake ? String(form.targetIntake) : null,

      // Budget
      budgetRange: form.budgetRange || null,
      fundingPlan: form.fundingPlan || null,

      // Readiness
      ieltsStatus: form.ieltsStatus || null,
      greStatus: form.greStatus || null,
      sopStatus: form.sopStatus || null,
    };

    // 🚨 IMPORTANT: backend rejects empty array; only include if non-empty
    if (Array.isArray(form.preferredCountries) && form.preferredCountries.length > 0) {
      payload.preferredCountries = form.preferredCountries;
    }

    return payload;
  };

  const persistDraft = async () => {
    const payload = buildPayload();
    await save(payload);
  };

  const handleNext = async () => {
    await persistDraft();
    if (canGoNext) setStepIdx((i) => i + 1);
  };

  const handleBack = () => {
    if (canGoBack) setStepIdx((i) => i - 1);
  };

  const handleFinish = async () => {
    await persistDraft();

    // backend sets completedAt when required fields are present
    // safest: refetch, then redirect if completedAt exists
    const updated = await fetchMyOnboarding();
    if (updated?.completedAt) navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Let’s set you up</h1>
          <p className="text-sm text-slate-600">
            Quick onboarding so we can personalize your shortlists + tasks.
          </p>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <StageStepper steps={STEPS.map((s) => s.title)} activeStep={stepIdx} />
          </div>

          <div className="p-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {typeof error === "string" ? error : error?.message || "Something went wrong"}
              </div>
            )}

            {current.key === "ACADEMICS" && <AcademicProfile value={form} onChange={setForm} />}
            {current.key === "GOALS" && <CareerGoals value={form} onChange={setForm} />}
            {current.key === "BUDGET" && <BudgetAndCountry value={form} onChange={setForm} />}
            {current.key === "READINESS" && <Readiness value={form} onChange={setForm} />}
            {current.key === "REVIEW" && <ReviewAndSubmit value={form} onboarding={onboarding} />}

            <div className="mt-6 flex items-center justify-between">
              <Button
                type="button"
                onClick={handleBack}
                disabled={!canGoBack || loading}
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
              >
                Back
              </Button>

              {current.key !== "REVIEW" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!stepIsValid || loading}
                  loading={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                  withArrow
                >
                  Save & Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={!stepIsValid || loading}
                  loading={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                  withArrow
                >
                  Finish Onboarding
                </Button>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-500">Your progress is saved automatically.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
