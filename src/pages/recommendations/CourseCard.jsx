// CourseCard.jsx (University card)
// Matches Prisma schema: University + ShortlistItem

import React, { useEffect, useMemo, useState } from "react";
import { Heart, ExternalLink, MapPin, Star, GraduationCap, BadgeInfo } from "lucide-react";

import useShortlistStore from "../../store/shortlistStore"; 
import useUniversitiesStore from "../../store/universitiesStore";

const fmtMoney = (currency, value) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${currency || ""}${currency ? " " : ""}${n.toLocaleString()}`.trim();
};

const riskBadge = (riskLevel) => {
  const v = (riskLevel || "").toString().toUpperCase();
  if (!v) return { label: "Risk: —", cls: "bg-zinc-100 text-zinc-700" };
  if (v.includes("LOW")) return { label: "Risk: Low", cls: "bg-emerald-100 text-emerald-800" };
  if (v.includes("MED")) return { label: "Risk: Med", cls: "bg-amber-100 text-amber-800" };
  if (v.includes("HIGH")) return { label: "Risk: High", cls: "bg-rose-100 text-rose-800" };
  return { label: `Risk: ${riskLevel}`, cls: "bg-zinc-100 text-zinc-700" };
};

/**
 * Props
 * - university: University object (preferred)
 * - universityId: if you only have ID, card will try to fetch details
 * - bucket: optional bucket to store in ShortlistItem.bucket (e.g. "DREAM" | "TARGET" | "SAFE")
 * - showDetailsButton: show "View details"
 * - onOpenDetails: optional callback (university) => void
 */
export default function CourseCard({
  university,
  universityId,
  bucket = null,
  showDetailsButton = true,
  onOpenDetails,
}) {
  const [localUni, setLocalUni] = useState(university || null);

  const {
    items: shortlistItems,
    loading: shortlistLoading,
    upsert,
    remove,
  } = useShortlistStore();

  const { fetchById, loading: uniLoading } = useUniversitiesStore();

  // If only ID was passed, fetch the university details once.
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (localUni || !universityId) return;
      try {
        const data = await fetchById(universityId);
        // universities.controller returns { ok, message, data } in some endpoints;
        // store normalizes to res.data, so handle both shapes safely.
        const uni = data?.data || data;
        if (alive) setLocalUni(uni);
      } catch {
        // keep silent; UI will show fallback
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [localUni, universityId, fetchById]);

  // If the parent passes a new university object later
  useEffect(() => {
    if (university) setLocalUni(university);
  }, [university]);

  const uni = localUni;

  const shortlistedItem = useMemo(() => {
    const id = uni?.id || universityId;
    if (!id) return null;
    return shortlistItems?.find((x) => x.universityId === id) || null;
  }, [shortlistItems, uni?.id, universityId]);

  const isShortlisted = !!shortlistedItem;

  const handleToggleShortlist = async () => {
    if (!uni?.id && !universityId) return;
    const id = uni?.id || universityId;

    if (isShortlisted) {
      await remove(id);
      return;
    }
    await upsert({ universityId: id, bucket: bucket || null });
  };

  const handleOpenDetails = async () => {
    if (!uni?.id && !universityId) return;
    const id = uni?.id || universityId;

    let full = uni;
    if (!full) {
      const data = await fetchById(id);
      full = data?.data || data;
    }
    onOpenDetails?.(full);
  };

  const {
    label: riskLabel,
    cls: riskCls,
  } = riskBadge(uni?.riskLevel);

  const totalCost =
    (Number.isFinite(Number(uni?.tuition)) ? Number(uni?.tuition) : 0) +
    (Number.isFinite(Number(uni?.living)) ? Number(uni?.living) : 0);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 md:p-5 flex gap-4">
        {/* Left: icon */}
        <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
          <GraduationCap className="h-6 w-6 text-zinc-700" />
        </div>

        {/* Middle: info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-zinc-900 truncate">
                {uni?.universityName || "University"}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {uni?.city ? `${uni.city}, ` : ""}
                  {uni?.country || "—"}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskCls}`}>
                  {riskLabel}
                </span>

                {typeof uni?.ratingOutOf5 === "number" && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full">
                    <Star className="h-3.5 w-3.5" />
                    {uni.ratingOutOf5.toFixed(1)}/5
                  </span>
                )}

                {typeof uni?.rankingGlobal === "number" && (
                  <span className="text-xs font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full">
                    Rank #{uni.rankingGlobal}
                  </span>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              {uni?.website && (
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  title="Open website"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden md:inline">Website</span>
                </a>
              )}

              <button
                onClick={handleToggleShortlist}
                disabled={shortlistLoading || (!uni?.id && !universityId)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border transition-colors
                  ${
                    isShortlisted
                      ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                      : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              >
                <Heart className={`h-4 w-4 ${isShortlisted ? "fill-current" : ""}`} />
                <span className="hidden md:inline">{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
              </button>
            </div>
          </div>

          {/* Bottom: metrics */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-xs text-zinc-600">Acceptance</div>
              <div className="text-sm font-semibold text-zinc-900 mt-0.5">
                {uni?.acceptanceRate || "—"}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-xs text-zinc-600">Top courses</div>
              <div className="text-sm font-semibold text-zinc-900 mt-0.5 truncate">
                {Array.isArray(uni?.topCourses) && uni.topCourses.length
                  ? uni.topCourses.slice(0, 2).join(", ")
                  : "—"}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-xs text-zinc-600">Tuition / year</div>
              <div className="text-sm font-semibold text-zinc-900 mt-0.5">
                {fmtMoney(uni?.costCurrency, uni?.tuition)}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-xs text-zinc-600">Living / year</div>
              <div className="text-sm font-semibold text-zinc-900 mt-0.5">
                {fmtMoney(uni?.costCurrency, uni?.living)}
              </div>
            </div>
          </div>

          {/* Extra info row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-1">
              <BadgeInfo className="h-4 w-4" />
              Total est. yearly cost:{" "}
              <span className="font-semibold text-zinc-800">
                {uni ? fmtMoney(uni.costCurrency, totalCost) : "—"}
              </span>
            </span>

            {Array.isArray(uni?.intake) && uni.intake.length ? (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                Intake: {uni.intake.slice(0, 2).join(", ")}
              </span>
            ) : null}

            {uni?.postStudyWork ? (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                PSW: {uni.postStudyWork}
              </span>
            ) : null}

            {uni?.visa ? (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                Visa: {uni.visa}
              </span>
            ) : null}
          </div>

          {showDetailsButton && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleOpenDetails}
                disabled={uniLoading || (!uni?.id && !universityId)}
                className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                View details
              </button>

              {bucket ? (
                <span className="text-xs text-zinc-600">
                  Suggested bucket: <span className="font-semibold text-zinc-900">{bucket}</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
