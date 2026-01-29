// src/features/onboarding/steps/CareerGoals.jsx
import { Input } from "../../../components/ui";

const TARGET_DEGREES = ["Bachelor’s", "Master’s", "MBA", "PhD", "Diploma/PG Diploma"];

export default function CareerGoals({ value, onChange }) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1">
          Target Degree *
        </label>
        <select
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          value={value.targetDegree}
          onChange={(e) => onChange((p) => ({ ...p, targetDegree: e.target.value }))}
        >
          <option value="">Select</option>
          {TARGET_DEGREES.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Target Intake *"
        placeholder="e.g., 2027"
        value={value.targetIntake}
        onChange={(e) =>
          onChange((p) => ({
            ...p,
            targetIntake: e.target.value.replace(/\D/g, "").slice(0, 4),
          }))
        }
        required
      />
    </div>
  );
}
