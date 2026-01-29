// src/features/onboarding/steps/BudgetAndCountry.jsx
import { Input, Badge } from "../../../components/ui";

const COUNTRIES = ["USA", "UK", "CANADA", "GERMANY", "AUSTRALIA"]; // Country enum values

const FUNDING = [
  { label: "Self-funded", value: "SELF_FUNDED" },
  { label: "Scholarship", value: "SCHOLARSHIP" },
  { label: "Loan", value: "LOAN" },
];

export default function BudgetAndCountry({ value, onChange }) {
  const toggleCountry = (c) => {
    onChange((p) => {
      const has = p.preferredCountries.includes(c);
      return {
        ...p,
        preferredCountries: has
          ? p.preferredCountries.filter((x) => x !== c)
          : [...p.preferredCountries, c],
      };
    });
  };

  return (
    <div className="grid gap-5">
      <div>
        <div className="text-sm font-semibold text-slate-800 mb-2">Preferred Countries *</div>

        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const active = value.preferredCountries.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCountry(c)}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition",
                  active
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {c} {active && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>

        {value.preferredCountries?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {value.preferredCountries.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1">Funding Plan *</label>
        <select
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          value={value.fundingPlan}
          onChange={(e) => onChange((p) => ({ ...p, fundingPlan: e.target.value }))}
        >
          <option value="">Select</option>
          {FUNDING.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Budget Range (optional)"
        placeholder="e.g., 25000"
        value={value.budgetRange}
        onChange={(e) => onChange((p) => ({ ...p, budgetRange: e.target.value }))}
      />
    </div>
  );
}
