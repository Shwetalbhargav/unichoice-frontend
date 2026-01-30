// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import useCounsellorStore from "../../store/counsellorStore";
import useOnboardingStore from "../../store/onboardingStore";
import useShortlistStore from "../../store/shortlistStore";
import useLockStore from "../../store/lockStore";

import CourseCard from "../recommendations/CourseCard";

const unwrap = (v) => {
  if (!v) return v;
  if (typeof v === "object" && "success" in v && "data" in v) return v.data;
  if (typeof v === "object" && "data" in v && Object.keys(v).length <= 3) return v.data;
  return v;
};

const money = (currency, n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return `${currency ? `${currency} ` : ""}${num.toLocaleString()}`;
};

const calcTotal = (u) => {
  const t = Number(u?.tuition ?? 0) || 0;
  const l = Number(u?.living ?? 0) || 0;
  const total = t + l;
  return total > 0 ? total : null;
};

const bucketPill = (bucket) => {
  const b = String(bucket || "").toUpperCase();
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  if (b === "DREAM") return `${base} bg-purple-100 text-purple-800`;
  if (b === "TARGET") return `${base} bg-blue-100 text-blue-800`;
  if (b === "SAFE") return `${base} bg-emerald-100 text-emerald-800`;
  return `${base} bg-zinc-100 text-zinc-800`;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const counsellor = useCounsellorStore();
  const onboardingStore = useOnboardingStore();
  const shortlist = useShortlistStore();
  const lockStore = useLockStore();

  const [activeTab, setActiveTab] = useState("RECS"); // RECS | OVERVIEW

  // --- bootstrap ---
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) stage guard
        const statusRaw = await counsellor.fetchStatus?.();
        const status = unwrap(statusRaw);
        const stage = status?.stage;

        if (!mounted) return;

        if (stage === "ONBOARDING") {
          navigate("/onboarding");
          return;
        }

        // 2) load essentials
        await Promise.allSettled([
          onboardingStore.fetch?.(),
          counsellor.fetchRecommendations?.(),
          shortlist.fetch?.(),
          lockStore.fetchActiveLocks?.(),
        ]);
      } catch {
        // best-effort load anyway
        await Promise.allSettled([
          onboardingStore.fetch?.(),
          counsellor.fetchRecommendations?.(),
          shortlist.fetch?.(),
          lockStore.fetchActiveLocks?.(),
        ]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onboarding = onboardingStore.onboarding || onboardingStore.data || null;

  // --- normalize recommendations into buckets ---
  const recBuckets = useMemo(() => {
    const out = { DREAM: [], TARGET: [], SAFE: [] };

    // counsellor.recommendations might be:
    // - { success:true, data:{...} }
    // - { data:{...} }
    // - {...}
    const recRoot = unwrap(counsellor.recommendations);
    const rec = recRoot?.data ? recRoot.data : recRoot;

    // 1) Deterministic buckets (preferred)
    const grouped =
      rec?.buckets || // if backend already returns buckets
      rec?.grouped ||
      rec?.raw?.grouped || // your current backend puts grouped here
      null;

    if (grouped) {
      out.DREAM = grouped.DREAM || [];
      out.TARGET = grouped.TARGET || [];
      out.SAFE = grouped.SAFE || [];
      return out;
    }

    // 2) Fallback: if raw.items exists and each item has bucket field
    const items = rec?.raw?.items || rec?.items || [];
    if (Array.isArray(items) && items.length) {
      out.DREAM = items.filter((u) => String(u?.bucket).toUpperCase() === "DREAM");
      out.TARGET = items.filter((u) => String(u?.bucket).toUpperCase() === "TARGET");
      out.SAFE = items.filter((u) => String(u?.bucket).toUpperCase() === "SAFE");
      return out;
    }

    // 3) AI format fallback (only if you have a byId map)
    const aiRecs = rec?.ai?.recommendations;
    const byId = counsellor.universitiesById || counsellor.byId || {};

    const aiToUni = (r, bucket) => byId?.[r?.universityId] || { id: r?.universityId, bucket };

    if (aiRecs?.DREAM || aiRecs?.TARGET || aiRecs?.SAFE) {
      out.DREAM = (aiRecs.DREAM || []).map((r) => aiToUni(r, "DREAM"));
      out.TARGET = (aiRecs.TARGET || []).map((r) => aiToUni(r, "TARGET"));
      out.SAFE = (aiRecs.SAFE || []).map((r) => aiToUni(r, "SAFE"));
      return out;
    }

    return out;
  }, [counsellor.recommendations, counsellor.universitiesById, counsellor.byId]);

  const activeLock = useMemo(() => lockStore.getActiveLock?.() || lockStore.locks?.[0] || null, [
    lockStore,
  ]);

  const isBusy = Boolean(
    counsellor.loading || onboardingStore.loading || shortlist.loading || lockStore.loading
  );

  const err = counsellor.error || onboardingStore.error || shortlist.error || lockStore.error || null;

  const nextAction = useMemo(() => {
    const shortlistCount = (shortlist.items || []).length;
    if (shortlistCount === 0) return { label: "Shortlist universities", path: "/shortlist" };
    if (!activeLock) return { label: "Lock final university", path: "/lock" };
    return { label: "Go to application guidance", path: "/guidance" };
  }, [shortlist.items, activeLock]);

  const ProfileRow = ({ label, value }) => (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xs text-zinc-600">{label}</div>
      <div className="text-sm font-semibold text-zinc-900 mt-0.5 truncate">{value || "—"}</div>
    </div>
  );

  const RecSection = ({ title, bucket, items }) => (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <span className={bucketPill(bucket)}>{bucket}</span>
        </div>
        <div className="text-sm text-zinc-600">{items?.length || 0} picks</div>
      </div>

      {!items?.length ? (
        <div className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-700">
          No recommendations in this bucket yet.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((u, idx) => {
            const id = u?.id || u?.universityId || `${bucket}-${idx}`;
            return (
              <div key={id} className="space-y-3">
                <CourseCard university={u} universityId={id} bucket={bucket} />

                <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="text-zinc-600">Total est. / year: </span>
                    <span className="font-semibold text-zinc-900">
                      {money(u?.costCurrency, calcTotal(u)) || "—"}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/shortlist")}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    Manage <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-7">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-600 mt-1">
            Your control center: profile → recommendations → shortlist → lock → guidance.
          </p>
        </div>

        <button
          onClick={() => navigate(nextAction.path)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-white px-5 py-3 text-sm font-semibold hover:bg-zinc-800"
        >
          {nextAction.label} <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {err ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {typeof err === "string" ? err : JSON.stringify(err)}
        </div>
      ) : null}

      {isBusy ? (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your dashboard…
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-zinc-900">Profile summary</div>
            <button
              onClick={() => navigate("/onboarding")}
              className="text-sm font-medium underline text-zinc-800"
            >
              Edit
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <ProfileRow label="Education level" value={onboarding?.educationLevel} />
            <ProfileRow label="Field of study" value={onboarding?.fieldOfStudy} />
            <ProfileRow
              label="Preferred countries"
              value={
                Array.isArray(onboarding?.preferredCountries)
                  ? onboarding.preferredCountries.join(", ")
                  : onboarding?.preferredCountries
              }
            />
            <ProfileRow label="Budget / year" value={onboarding?.budgetPerYear || onboarding?.budgetRange} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold text-zinc-900">Status</div>

          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs text-zinc-600">Shortlisted</div>
              <div className="text-lg font-semibold text-zinc-900 mt-0.5">
                {(shortlist.items || []).length}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs text-zinc-600">Locked</div>
              <div className="mt-1 flex items-center gap-2">
                {activeLock ? (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Yes
                    </span>
                    <button
                      onClick={() => navigate("/lock")}
                      className="text-sm font-medium underline text-zinc-800"
                    >
                      View
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 px-3 py-1 text-sm font-medium">
                    Not yet
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-xs text-zinc-600">AI counsellor</div>
              <button
                onClick={() => navigate("/ai")}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Ask AI <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex gap-2">
        <button
          onClick={() => setActiveTab("RECS")}
          className={`px-4 py-2 rounded-xl text-sm border ${
            activeTab === "RECS"
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-4 py-2 rounded-xl text-sm border ${
            activeTab === "OVERVIEW"
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
          }`}
        >
          What to do next
        </button>
      </div>

      {activeTab === "OVERVIEW" ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold text-zinc-900">Your next steps</div>
          <ol className="mt-3 space-y-3 text-sm text-zinc-700 list-decimal pl-5">
            <li>
              Review recommendations and shortlist 4–8 universities (mix Dream/Target/Safe).
              <button
                onClick={() => navigate("/shortlist")}
                className="ml-2 underline font-medium text-zinc-900"
              >
                Go to shortlist
              </button>
            </li>
            <li>
              Lock 1 final university once you’re confident.
              <button
                onClick={() => navigate("/lock")}
                className="ml-2 underline font-medium text-zinc-900"
              >
                Lock now
              </button>
            </li>
            <li>
              Follow application guidance + tasks (SOP, LORs, transcripts, exams).
              <button
                onClick={() => navigate("/guidance")}
                className="ml-2 underline font-medium text-zinc-900"
              >
                Open guidance
              </button>
            </li>
          </ol>
        </div>
      ) : (
        <>
          <RecSection title="Dream picks" bucket="DREAM" items={recBuckets.DREAM} />
          <RecSection title="Target picks" bucket="TARGET" items={recBuckets.TARGET} />
          <RecSection title="Safe picks" bucket="SAFE" items={recBuckets.SAFE} />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/shortlist")}
              className="px-4 py-3 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Manage shortlist
            </button>
            <button
              onClick={() => navigate("/lock")}
              className="px-4 py-3 rounded-2xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800"
            >
              Lock final university
            </button>
            <button
              onClick={() => counsellor.fetchRecommendations?.()}
              className="px-4 py-3 rounded-2xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800"
            >
              Refresh recommendations
            </button>
          </div>
        </>
      )}
    </div>
  );
}
