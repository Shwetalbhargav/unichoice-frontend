// src/pages/recommendations/UniversityCard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useShortlistStore from "../../store/shortlistStore";
import useUniversitiesStore from "../../store/universitiesStore";
import useLockStore from "../../store/lockStore";

// If you have a dedicated component, plug it in.
// import DecisionExplanation from "./DecisionExplanation";

const money = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString() : "—");
const safeUpper = (s) => (typeof s === "string" ? s.toUpperCase() : "");

const badgeClass = (bucket) => {
  const b = safeUpper(bucket);
  if (b === "DREAM") return "bg-purple-100 text-purple-800";
  if (b === "TARGET") return "bg-blue-100 text-blue-800";
  if (b === "SAFE") return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-800";
};

const uniName = (u) => u?.universityName || "University";
const uniLocation = (u) => [u?.city, u?.country].filter(Boolean).join(", ");

const Pill = ({ children }) => (
  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{children}</span>
);

function normalizeError(e) {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    (typeof e === "string" ? e : null) ||
    "Something went wrong"
  );
}

export default function UniversityCard({
  university,
  bucket, // DREAM | TARGET | SAFE (optional)
  showLock = true,
  lockMode = "route", // "route" | "direct"
  onLocked,
  compact = false, // optional: smaller card variant
}) {
  const navigate = useNavigate();

  const shortlistStore = useShortlistStore();
  const universitiesStore = useUniversitiesStore();
  const lockStore = useLockStore();

  const [whyOpen, setWhyOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [localBusy, setLocalBusy] = useState(false);
  const [localError, setLocalError] = useState(null);

  // University id may come as full object or stub
  const universityId = university?.id || university?.universityId;

  // prefer fetched full details (if user opened details)
  const full = universityId ? universitiesStore.byId?.[universityId] : null;
  const u = full || university;

  const title = uniName(u);
  const loc = uniLocation(u);

  const currency = u?.costCurrency || "";
  const tuition = u?.tuition;
  const living = u?.living;

  const rating = u?.ratingOutOf5;
  const rank = u?.rankingGlobal;
  const acceptance = u?.acceptanceRate;
  const risk = u?.riskLevel;

  const topCourses = Array.isArray(u?.topCourses) ? u.topCourses : [];
  const intake = Array.isArray(u?.intake) ? u.intake : [];
  const scholarship = Array.isArray(u?.scholarship) ? u.scholarship : [];

  // supports deterministic reasons from universities.service bucket logic
  const reasons = Array.isArray(u?.reasons) ? u.reasons : [];

  // shortlist lookup
  const shortlistedIds = useMemo(() => {
    const set = new Set();
    (shortlistStore.items || []).forEach((it) => {
      if (it?.universityId) set.add(it.universityId);
    });
    return set;
  }, [shortlistStore.items]);

  const isShortlisted = !!universityId && shortlistedIds.has(universityId);

  // lock lookup (active locks only)
  const activeLocks = lockStore.locks || [];
  const activeLock = useMemo(() => {
    if (!universityId) return null;
    return activeLocks.find((l) => l?.universityId === universityId) || null;
  }, [activeLocks, universityId]);

  const isLocked = !!activeLock;

  // Busy state: store busy OR local busy
  const busy = localBusy || shortlistStore.loading || lockStore.loading;

  const onAddRemove = async () => {
    if (!universityId) return;

    setLocalError(null);
    setLocalBusy(true);

    try {
      if (isShortlisted) {
        await shortlistStore.remove(universityId);
      } else {
        await shortlistStore.upsert({ universityId, bucket: bucket || u?.bucket });
      }
    } catch (e) {
      setLocalError(normalizeError(e));
    } finally {
      setLocalBusy(false);
    }
  };

  const onLock = async () => {
    if (!universityId) return;

    setLocalError(null);

    // if already locked, take user to lock page (manage/unlock etc.)
    if (isLocked) {
      navigate(`/lock?universityId=${encodeURIComponent(universityId)}`);
      return;
    }

    if (lockMode === "direct") {
      setLocalBusy(true);
      try {
        const res = await lockStore.lockUniversity(universityId, { autoCreateTasks: true });
        onLocked?.(res);
        // Optional: after direct lock, take them forward
        navigate("/application");
      } catch (e) {
        setLocalError(normalizeError(e));
      } finally {
        setLocalBusy(false);
      }
      return;
    }

    navigate(`/lock?universityId=${encodeURIComponent(universityId)}`);
  };

  const onToggleDetails = async () => {
    if (!universityId) return;

    const next = !detailsOpen;
    setDetailsOpen(next);

    if (next && !full) {
      setLocalError(null);
      setDetailsLoading(true);
      try {
        await universitiesStore.fetchById(universityId);
      } catch (e) {
        setLocalError(normalizeError(e));
      } finally {
        setDetailsLoading(false);
      }
    }
  };

  const primaryBucket = bucket || u?.bucket;
  const bucketLabel = primaryBucket ? safeUpper(primaryBucket) : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>

            {bucketLabel ? (
              <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(bucketLabel)}`}>
                {bucketLabel}
              </span>
            ) : null}

            {isLocked ? (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                LOCKED
              </span>
            ) : null}
          </div>

          <p className="text-sm text-gray-600 mt-1">{loc || "—"}</p>

          {u?.website ? (
            <a
              href={u.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-700 underline mt-1 inline-block"
            >
              Website
            </a>
          ) : null}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-2">
          <button
            disabled={busy || !universityId}
            onClick={onAddRemove}
            className={`px-3 py-2 rounded-xl text-sm border disabled:opacity-60 ${
              isShortlisted
                ? "border-gray-300 hover:bg-gray-50"
                : "border-black bg-black text-white hover:opacity-90"
            }`}
          >
            {isShortlisted ? "Remove" : "Add to shortlist"}
          </button>

          {showLock ? (
            <button
              disabled={busy || !universityId}
              onClick={onLock}
              className={`px-3 py-2 rounded-xl text-sm border disabled:opacity-60 ${
                isLocked ? "border-amber-300 bg-amber-50 hover:bg-amber-100" : "border-gray-300 hover:bg-gray-50"
              }`}
              title={isLocked ? "Already locked (open lock page)" : "Lock this university"}
            >
              {isLocked ? "View lock" : "Lock this university"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Inline errors */}
      {(localError || shortlistStore.error || lockStore.error) ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {localError || shortlistStore.error || lockStore.error}
        </div>
      ) : null}

      {/* Stats */}
      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"} gap-3 mt-4`}>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Rating</div>
          <div className="font-medium">{rating ? `${Number(rating).toFixed(1)}/5` : "—"}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Global rank</div>
          <div className="font-medium">{rank ?? "—"}</div>
        </div>

        {!compact ? (
          <>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Tuition</div>
              <div className="font-medium">
                {tuition != null ? `${currency} ${money(tuition)}` : "—"}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Living</div>
              <div className="font-medium">
                {living != null ? `${currency} ${money(living)}` : "—"}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {acceptance ? <Pill>Acceptance: {acceptance}</Pill> : null}
        {risk ? <Pill>Risk: {String(risk)}</Pill> : null}
        {Array.isArray(u?.exams) ? null : null /* exams is Json in schema; render in details */ }
      </div>

      {/* Top courses */}
      {topCourses.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Top courses</div>
          <div className="flex flex-wrap gap-2">
            {topCourses.slice(0, 6).map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
        </div>
      ) : null}

      {/* Why this */}
      <div className="mt-4">
        <button
          onClick={() => setWhyOpen((v) => !v)}
          className="text-sm underline text-gray-800"
          type="button"
        >
          {whyOpen ? "Hide why this" : "Why this?"}
        </button>

        {whyOpen ? (
          <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            {/* If you have a dedicated component, use it here */}
            {/* <DecisionExplanation university={u} bucket={bucketLabel} /> */}

            {reasons.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {reasons.slice(0, 6).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600">
                This is recommended based on your onboarding profile and overall fit (rank, rating, and budget signals).
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Details (fetch on demand) */}
      <div className="mt-4">
        <button
          onClick={onToggleDetails}
          disabled={!universityId}
          className="text-sm underline text-gray-800 disabled:opacity-60"
          type="button"
        >
          {detailsOpen ? "Hide details" : "View details"}
        </button>

        {detailsOpen ? (
          <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            {detailsLoading ? (
              <div className="text-gray-600">Loading details…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Language</div>
                    <div className="font-medium">{u?.language || "—"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Courses offered</div>
                    <div className="font-medium">{u?.numberOfCourses ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Post study work</div>
                    <div className="font-medium">{u?.postStudyWork || "—"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Visa</div>
                    <div className="font-medium">{u?.visa || "—"}</div>
                  </div>
                </div>

                {u?.exams ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">Exams</div>
                    <pre className="text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 overflow-auto">
{JSON.stringify(u.exams, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {intake.length > 0 ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">Intakes</div>
                    <div className="flex flex-wrap gap-2">
                      {intake.map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                ) : null}

                {scholarship.length > 0 ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-2">Scholarships</div>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.slice(0, 10).map((x) => (
                        <Pill key={x}>{x}</Pill>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
