// src/features/onboarding/steps/Readiness.jsx

const EXAM_STATUS = [
  { label: "Not started", value: "NOT_STARTED" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const SOP_STATUS = [
  { label: "Not started", value: "NOT_STARTED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Ready", value: "READY" },
];

export default function Readiness({ value, onChange }) {
  const Select = ({ label, field, options }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-1">{label}</label>
      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
        value={value[field]}
        onChange={(e) => onChange((p) => ({ ...p, [field]: e.target.value }))}
      >
        <option value="">Select</option>
        {options.map((x) => (
          <option key={x.value} value={x.value}>
            {x.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="grid gap-4">
      <Select label="IELTS Status (optional)" field="ieltsStatus" options={EXAM_STATUS} />
      <Select label="GRE Status (optional)" field="greStatus" options={EXAM_STATUS} />
      <Select label="SOP Status (optional)" field="sopStatus" options={SOP_STATUS} />

      <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-slate-700">
        You can skip these now — filling them later will improve recommendations.
      </div>
    </div>
  );
}
