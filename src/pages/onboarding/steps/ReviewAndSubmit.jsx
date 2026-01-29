// src/features/onboarding/steps/ReviewAndSubmit.jsx
const FUNDING_LABEL = {
  SELF_FUNDED: "Self-funded",
  SCHOLARSHIP: "Scholarship",
  LOAN: "Loan",
};

const EXAM_LABEL = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const SOP_LABEL = {
  NOT_STARTED: "Not started",
  DRAFT: "Draft",
  READY: "Ready",
};

export default function ReviewAndSubmit({ value, onboarding }) {
  const Row = ({ k, v }) => (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-3">
      <div className="text-sm font-semibold text-slate-700">{k}</div>
      <div className="text-sm text-slate-900 text-right break-words">
        {v || <span className="text-slate-400">—</span>}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="text-sm font-bold text-slate-900">Quick Review</div>
        <div className="text-xs text-slate-600">
          We’ll use this to personalize your university shortlists + tasks.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white">
        <div className="px-4">
          <Row k="Education level" v={value.educationLevel} />
          <Row k="Field of study" v={value.fieldOfStudy} />
          <Row k="Graduation year" v={value.graduationYear} />

          <Row k="Target degree" v={value.targetDegree} />
          <Row k="Target intake" v={value.targetIntake} />

          <Row
            k="Preferred countries"
            v={value.preferredCountries?.length ? value.preferredCountries.join(", ") : ""}
          />
          <Row k="Funding plan" v={FUNDING_LABEL[value.fundingPlan] || value.fundingPlan} />
          <Row k="Budget range" v={value.budgetRange} />

          <Row k="IELTS status" v={EXAM_LABEL[value.ieltsStatus] || value.ieltsStatus} />
          <Row k="GRE status" v={EXAM_LABEL[value.greStatus] || value.greStatus} />
          <Row k="SOP status" v={SOP_LABEL[value.sopStatus] || value.sopStatus} />
        </div>
      </div>

      {onboarding?.completedAt ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✅ Onboarding already completed.
        </div>
      ) : (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
          Click <b>Finish Onboarding</b> to confirm — then we’ll move you to Dashboard.
        </div>
      )}
    </div>
  );
}
