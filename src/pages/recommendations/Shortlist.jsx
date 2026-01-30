// src/pages/recommendations/Shortlist.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useShortlistStore from "../../store/shortlistStore";
import useCounsellorStore from "../../store/counsellorStore";
import useUniversitiesStore from "../../store/universitiesStore";

// ---------- helpers (shape-safe) ----------
const unwrap = (v) => {
  // supports: {success:true,data:...} OR already-unwrapped data OR null
  if (!v) return v;
  if (typeof v === "object" && "success" in v && "data" in v) return v.data;
  if (typeof v === "object" && "data" in v && Object.keys(v).length <= 3) return v.data;
  return v;
};

const uniName = (u) => u?.universityName || u?.name || u?.title || "University";
const uniLocation = (u) => [u?.city, u?.country].filter(Boolean).join(", ");
const money = (n) => (Number.isFinite(Number(n)) ? Number(n).toLocaleString() : "—");

const badgeClass = (bucket) => {
  if (bucket === "DREAM") return "bg-purple-100 text-purple-800";
  if (bucket === "TARGET") return "bg-blue-100 text-blue-800";
  if (bucket === "SAFE") return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-800";
};

// ---------- component ----------
export default function Shortlist() {
  const navigate = useNavigate();

  const shortlistStore = useShortlistStore();
  const counsellorStore = useCounsellorStore();
  const universitiesStore = useUniversitiesStore();

  const [activeTab, setActiveTab] = useState("RECS"); // RECS | MY

  // Build quick lookup: which universities are shortlisted already
  const shortlistedIds = useMemo(() => {
    const set = new Set();
    (shortlistStore.items || []).forEach((it) => {
      if (it?.universityId) set.add(it.universityId);
      // sometimes include university relation only; still keep universityId as source of truth
    });
    return set;
  }, [shortlistStore.items]);

  // Fetch / guard onboarding
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Guard: if onboarding incomplete, redirect
        const statusRaw = await counsellorStore.fetchStatus();
        const status = unwrap(statusRaw);
        const stage = status?.stage || status?.data?.stage; // extra safe
        if (!mounted) return;

        if (stage === "ONBOARDING") {
          navigate("/onboarding");
          return;
        }

        // Fetch recs + shortlist
        await Promise.allSettled([
          counsellorStore.fetchRecommendations(),
          shortlistStore.fetch(),
        ]);

        // Optional: if you later want query-driven list
        // await universitiesStore.fetchFromOnboarding();
      } catch (e) {
        // If status call fails, still try to load page data (best-effort)
        await Promise.allSettled([
          counsellorStore.fetchRecommendations(),
          shortlistStore.fetch(),
        ]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize recommendations into 3 buckets with university objects
  const recBuckets = useMemo(() => {
    const out = { DREAM: [], TARGET: [], SAFE: [] };

    const recRaw = unwrap(counsellorStore.recommendations);

    // Path A: deterministic buckets from backend: { buckets: {DREAM:[uni],...}, raw, ai, ... }
    const deterministicBuckets = recRaw?.buckets || recRaw?.grouped || recRaw?.raw?.grouped;
    if (deterministicBuckets?.DREAM || deterministicBuckets?.TARGET || deterministicBuckets?.SAFE) {
      out.DREAM = deterministicBuckets.DREAM || [];
      out.TARGET = deterministicBuckets.TARGET || [];
      out.SAFE = deterministicBuckets.SAFE || [];
      return out;
    }

    // Path B: universities service grouped: { grouped: {DREAM:[...],...}, items:[...] }
    const grouped = recRaw?.grouped;
    if (grouped?.DREAM || grouped?.TARGET || grouped?.SAFE) {
      out.DREAM = grouped.DREAM || [];
      out.TARGET = grouped.TARGET || [];
      out.SAFE = grouped.SAFE || [];
      return out;
    }

    // Path C: AI format: { ai: { recommendations: { DREAM:[{universityId,...}], ... } }, buckets: ... }
    const aiRecs = recRaw?.ai?.recommendations || recRaw?.ai?.recommendations;
    const byId = universitiesStore.byId || {};

    const aiToUni = (r) => {
      // If we already have full uni somewhere, great; otherwise show a minimal stub
      const found = byId?.[r?.universityId];
      return found || { id: r?.universityId, bucket: r?.bucket };
    };

    if (aiRecs?.DREAM || aiRecs?.TARGET || aiRecs?.SAFE) {
      out.DREAM = (aiRecs.DREAM || []).map(aiToUni);
      out.TARGET = (aiRecs.TARGET || []).map(aiToUni);
      out.SAFE = (aiRecs.SAFE || []).map(aiToUni);
      return out;
    }

    return out;
  }, [counsellorStore.recommendations, universitiesStore.byId]);

  const isBusy = shortlistStore.loading || counsellorStore.loading || universitiesStore.loading;
  const errorMsg = shortlistStore.error || counsellorStore.error || universitiesStore.error;

  const addToShortlist = async (universityId, bucket) => {
    if (!universityId) return;
    await shortlistStore.upsert({ universityId, bucket });
  };

  const removeFromShortlist = async (universityId) => {
    if (!universityId) return;
    await shortlistStore.remove(universityId);
  };

  const ShortlistButton = ({ universityId, bucket }) => {
    const inShortlist = shortlistedIds.has(universityId);
    if (inShortlist) {
      return (
        <button
          onClick={() => removeFromShortlist(universityId)}
          className="px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
        >
          Remove
        </button>
      );
    }
    return (
      <button
        onClick={() => addToShortlist(universityId, bucket)}
        className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 text-sm"
      >
        Add to shortlist
      </button>
    );
  };

  const UniCard = ({ uni, bucket }) => {
    const id = uni?.id || uni?.universityId;
    const title = uniName(uni);
    const loc = uniLocation(uni);

    const tuition = uni?.tuition;
    const living = uni?.living;
    const currency = uni?.costCurrency || "";

    const rating = uni?.ratingOutOf5 ?? uni?.rating;
    const rank = uni?.rankingGlobal ?? uni?.ranking;

    const topCourses = Array.isArray(uni?.topCourses) ? uni.topCourses : [];
    const reasons = Array.isArray(uni?.reasons) ? uni.reasons : [];

    return (
      <div className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {bucket ? (
                <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(bucket)}`}>
                  {bucket}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-gray-600 mt-1">{loc || "—"}</p>
          </div>

          <div className="shrink-0">
            <ShortlistButton universityId={id} bucket={bucket} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Rating</div>
            <div className="font-medium">{rating ? `${Number(rating).toFixed(1)}/5` : "—"}</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="text-xs text-gray-500">Global rank</div>
            <div className="font-medium">{rank ?? "—"}</div>
          </div>
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
        </div>

        {topCourses.length > 0 ? (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Top courses</div>
            <div className="flex flex-wrap gap-2">
              {topCourses.slice(0, 6).map((c) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {reasons.length > 0 ? (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Why it matches</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {reasons.slice(0, 3).map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  // Group shortlist items by bucket
  const myShortlistGrouped = useMemo(() => {
    const base = { DREAM: [], TARGET: [], SAFE: [], OTHER: [] };
    (shortlistStore.items || []).forEach((it) => {
      const bucket = (it?.bucket || "").toUpperCase();
      const uni = it?.university || {};
      const merged = { ...uni, id: it?.universityId || uni?.id, _shortlist: it };

      if (bucket === "DREAM") base.DREAM.push(merged);
      else if (bucket === "TARGET") base.TARGET.push(merged);
      else if (bucket === "SAFE") base.SAFE.push(merged);
      else base.OTHER.push(merged);
    });
    return base;
  }, [shortlistStore.items]);

  const Section = ({ title, bucket, items }) => (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-600 bg-white">
          Nothing here yet.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((u) => (
            <UniCard key={u?.id} uni={u} bucket={bucket} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shortlist</h1>
          <p className="text-gray-600 mt-1">
            Add universities from your Dream/Target/Safe recommendations, then lock one when ready.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("RECS")}
            className={`px-4 py-2 rounded-xl text-sm border ${
              activeTab === "RECS" ? "bg-black text-white border-black" : "bg-white border-gray-300"
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab("MY")}
            className={`px-4 py-2 rounded-xl text-sm border ${
              activeTab === "MY" ? "bg-black text-white border-black" : "bg-white border-gray-300"
            }`}
          >
            My shortlist
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)}
        </div>
      ) : null}

      {isBusy ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Loading…
        </div>
      ) : null}

      {activeTab === "RECS" ? (
        <>
          <Section title="Dream" bucket="DREAM" items={recBuckets.DREAM || []} />
          <Section title="Target" bucket="TARGET" items={recBuckets.TARGET || []} />
          <Section title="Safe" bucket="SAFE" items={recBuckets.SAFE || []} />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/lock")}
              className="px-4 py-3 rounded-2xl bg-black text-white hover:opacity-90"
            >
              Go to Lock (commit)
            </button>
            <button
              onClick={async () => {
                await Promise.allSettled([
                  counsellorStore.fetchRecommendations(),
                  shortlistStore.fetch(),
                ]);
              }}
              className="px-4 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </>
      ) : (
        <>
          <Section title="My Dream shortlist" bucket="DREAM" items={myShortlistGrouped.DREAM} />
          <Section title="My Target shortlist" bucket="TARGET" items={myShortlistGrouped.TARGET} />
          <Section title="My Safe shortlist" bucket="SAFE" items={myShortlistGrouped.SAFE} />
          <Section title="Unbucketed" bucket={null} items={myShortlistGrouped.OTHER} />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/lock")}
              className="px-4 py-3 rounded-2xl bg-black text-white hover:opacity-90"
            >
              Lock a university
            </button>
            <button
              onClick={() => shortlistStore.fetch()}
              className="px-4 py-3 rounded-2xl border border-gray-300 hover:bg-gray-50"
            >
              Refresh shortlist
            </button>
          </div>
        </>
      )}
    </div>
  );
}
