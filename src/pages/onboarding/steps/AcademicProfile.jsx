// src/features/onboarding/steps/AcademicProfile.jsx
import { Input } from "../../../components/ui";

const EDUCATION_LEVELS = ["High School", "Diploma", "Bachelor’s", "Master’s", "PhD"];

export default function AcademicProfile({ value, onChange }) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          Education Level *
        </label>
        <select
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          value={value.educationLevel}
          onChange={(e) => onChange((p) => ({ ...p, educationLevel: e.target.value }))}
        >
          <option value="">Select</option>
          {EDUCATION_LEVELS.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Field of Study *"
        placeholder="e.g., Computer Science"
        value={value.fieldOfStudy}
        onChange={(e) => onChange((p) => ({ ...p, fieldOfStudy: e.target.value }))}
        required
      />

      <Input
        label="Graduation Year (optional)"
        placeholder="e.g., 2025"
        value={value.graduationYear}
        onChange={(e) =>
          onChange((p) => ({
            ...p,
            graduationYear: e.target.value.replace(/\D/g, "").slice(0, 4),
          }))
        }
      />
    </div>
  );
}
