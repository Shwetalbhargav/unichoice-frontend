import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Coins, Percent, Shield, Sparkles } from "lucide-react";

import useCounsellorStore from "../../store/counsellorStore";
import useOnboardingStore from "../../store/onboardingStore";
import useUniversitiesStore from "../../store/universitiesStore";

/**
 * Fallback helpers (no AI yet)
 */
const parsePercent = (s) => {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
};

const calcTotalCost = (u) => (Number(u?.tuition ?? 0) || 0) + (Number(u?.living ?? 0) || 0);

const costCategory = (u) => {
  const t = calcTotalCost(u);
  if (!t) return "MEDIUM";
  if (t <= 20000) return "LOW";
  if (t <= 40000) return "MEDIUM";
  return "HIGH";
};

// deterministic acceptance chance from acceptanceRate string like "8%"
const acceptanceChance = (u) => {
  const p = parsePercent(u?.acceptanceRate);
  if (p === null) return "MEDIUM";
  if (p <= 15) return "LOW";
  if (p <= 35) return "MEDIUM";
  return "HIGH";
};

// deterministic bucket from chance (same spirit as counsellor bucketize)
const bucketFromChance = (chance) => {
  const v = (chance || "MEDIUM").toUpperCase();
  if (v === "LOW") return "DREAM";
  if (v === "HIGH") return "SAFE";
  return "TARGET";
};

const pill = (text, tone = "neutral") => {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium";
  const tones = {
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    bad: "bg-rose-100 text-rose-800",
    neutral: "bg-zinc-100 text-zinc-800",
  };
  return <span className={`${base} ${tones[tone] || tones.neutral}`}>{text}</span>;
};

export default function DecisionExplanation({
  universityId,
  university: universityProp, // optional; if not passed we’ll fetch via store
  showHeader = true,
}) {
  const { recommendations, loading: counsellorLoading, fetchRecommendations } = useCounsellorStore();
  const { onboarding } = useOnboardingStore();
  const { fetchById, loading: uniLoading } = useUniversitiesStore();

  const [university, setUniversity] = useState(universityProp || null);

  // Ensure we have the university object
  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (universityProp) return;
      if (!universityId) return;

      try {
        const u = await fetchById(universityId);
        if (alive) setUniversity(u?.data || u);
      } catch {
        // ignore
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [universityId, universityProp, fetchById]);

  // If parent provides it later
  useEffect(() => {
    if (universityProp) setUniversity(universityProp);
  }, [universityProp]);

  // If we don’t have recommendations yet, try to fetch (optional)
  useEffect(() => {
    // Keep this super conservative so it doesn't spam:
    // only fetch if we have no recommendations at all.
    if (!recommendations) {
      // no params needed for MVP
      fetchRecommendations?.().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 1) Prefer server/AI explanation if present in recommendations.ai
   * counsellor.service.getRecommendations returns { raw, buckets, ai, stage, next } :contentReference[oaicite:0]{index=0}
   * counsellorStore stores res.data into recommendations :contentReference[oaicite:1]{index=1}
   */
  const aiExplanation = useMemo(() => {
    const uniId = university?.id || universityId;
    if (!uniId) return null;

    const ai = recommendations?.ai;
    if (!ai?.recommendations) return null;

    const all = [
      ...(ai.recommendations.DREAM || []),
      ...(ai.recommendations.TARGET || []),
      ...(ai.recommendations.SAFE || []),
    ];

    const hit = all.find((x) => x.universityId === uniId);
    if (!hit) return null;

    const bucket =
      (ai.recommendations.DREAM || []).some((x) => x.universityId === uniId)
        ? "DREAM"
        : (ai.recommendations.SAFE || []).some((x) => x.universityId === uniId)
          ? "SAFE"
          : "TARGET";

    return {
      bucket,
      fitReasons: hit.why_fit ? [hit.why_fit] : [],
      riskReasons: Array.isArray(hit.risks) ? hit.risks : [],
      costLevel: hit.costLevel || null,
      acceptanceChance: hit.acceptance || null,
    };
  }, [recommendations, university?.id, universityId]);

  /**
   * 2) Deterministic fallback (no AI yet)
   * Uses onboarding + university object
   */
  const fallbackExplanation = useMemo(() => {
    if (!university) return null;

    const costLevel = costCategory(university);
    const acceptance = acceptanceChance(university);
    const bucket = bucketFromChance(acceptance);

    const fitReasons = [];
    const riskReasons = [];

    // Fit signals
    if (onboarding?.preferredCountries?.includes(university.country)) {
      fitReasons.push(`Matches your preferred country: ${university.country}`);
    }
    if (onboarding?.fieldOfStudy && Array.isArray(university.topCourses)) {
      if (university.topCourses.some((c) => String(c).toLowerCase().includes(String(onboarding.fieldOfStudy).toLowerCase()))) {
        fitReasons.push(`Strong match to your field of study: ${onboarding.fieldOfStudy}`);
      }
    }
    if (typeof university.rankingGlobal === "number" && university.rankingGlobal <= 300) {
      fitReasons.push(`Strong global reputation (Rank #${university.rankingGlobal})`);
    }
    if (typeof university.ratingOutOf5 === "number" && university.ratingOutOf5 >= 4.2) {
      fitReasons.push(`High student rating (${university.ratingOutOf5.toFixed(1)}/5)`);
    }
    if (university.postStudyWork) {
      fitReasons.push(`Post-study work info available: ${university.postStudyWork}`);
    }

    // Risk signals
    if (university.riskLevel) {
      const rl = String(university.riskLevel).toUpperCase();
      if (rl.includes("HIGH")) riskReasons.push("Higher risk level (visa / competitiveness / complexity).");
      if (rl.includes("MED")) riskReasons.push("Medium risk level — plan documents early.");
    }
    if (costLevel === "HIGH") riskReasons.push("Cost looks on the higher side versus common budgets.");
    if (acceptance === "LOW") riskReasons.push("Acceptance chance may be low — keep strong backups.");

    // ensure not empty
    if (fitReasons.length === 0) fitReasons.push("This is a reasonable match based on your current filters.");
    if (riskReasons.length === 0) riskReasons.push("No major red flags detected from available data.");

    return { bucket, fitReasons, riskReasons, costLevel, acceptanceChance: acceptance };
  }, [university, onboarding]);

  const explanation = aiExplanation || fallbackExplanation;

  if (!university || !explanation) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm text-zinc-700">
          Loading decision explanation…
          {(counsellorLoading || uniLoading) ? " " : ""}
        </div>
      </div>
    );
  }

  const bucketTone =
    explanation.bucket === "DREAM" ? "warn" : explanation.bucket === "SAFE" ? "good" : "neutral";

  const costTone =
    explanation.costLevel === "LOW" ? "good" : explanation.costLevel === "HIGH" ? "bad" : "neutral";

  const accTone =
    explanation.acceptanceChance === "HIGH"
      ? "good"
      : explanation.acceptanceChance === "LOW"
        ? "warn"
        : "neutral";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="p-4 md:p-5">
        {showHeader && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-zinc-900 truncate">
                Why this is recommended
              </div>
              <div className="text-sm text-zinc-600 mt-1 truncate">
                {university.universityName} • {university.city}, {university.country}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pill(`Bucket: ${explanation.bucket}`, bucketTone)}
              {pill(
                <>
                  <Coins className="h-3.5 w-3.5" /> Cost: {explanation.costLevel}
                </>,
                costTone
              )}
              {pill(
                <>
                  <Percent className="h-3.5 w-3.5" /> Acceptance: {explanation.acceptanceChance}
                </>,
                accTone
              )}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fit reasons */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <BadgeCheck className="h-5 w-5" />
              Fit reasons
            </div>
            <ul className="mt-2 space-y-2 text-sm text-emerald-900/90">
              {explanation.fitReasons.map((r, idx) => (
                <li key={idx} className="flex gap-2">
                  <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk reasons */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <AlertTriangle className="h-5 w-5" />
              Risk flags
            </div>
            <ul className="mt-2 space-y-2 text-sm text-amber-900/90">
              {explanation.riskReasons.map((r, idx) => (
                <li key={idx} className="flex gap-2">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Small footer: cost breakdown */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-sm font-semibold text-zinc-900">Cost snapshot</div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-xs text-zinc-600">Tuition / year</div>
              <div className="font-semibold text-zinc-900">
                {university.costCurrency ? `${university.costCurrency} ` : ""}
                {university.tuition?.toLocaleString?.() ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Living / year</div>
              <div className="font-semibold text-zinc-900">
                {university.costCurrency ? `${university.costCurrency} ` : ""}
                {university.living?.toLocaleString?.() ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Total / year</div>
              <div className="font-semibold text-zinc-900">
                {university.costCurrency ? `${university.costCurrency} ` : ""}
                {calcTotalCost(university).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-600">Acceptance rate</div>
              <div className="font-semibold text-zinc-900">{university.acceptanceRate || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
