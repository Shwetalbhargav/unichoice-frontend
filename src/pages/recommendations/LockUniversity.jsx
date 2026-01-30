import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Unlock, Loader2 } from "lucide-react";

import useShortlistStore from "../../store/shortlistStore";
import useLockStore from "../../store/lockStore";
import useTasksStore from "../../store/tasksStore";
import useMiscStore from "../../store/miscStore";

function clsx(...s) {
  return s.filter(Boolean).join(" ");
}

export default function LockUniversity() {
  const navigate = useNavigate();

  const {
    items: shortlistItems,
    loading: shortlistLoading,
    error: shortlistError,
    fetch: fetchShortlist,
  } = useShortlistStore();

  const {
    locks,
    loading: lockLoading,
    error: lockError,
    fetchActiveLocks,
    lockUniversity,
    unlockUniversity,
    getActiveLock,
  } = useLockStore();

  const { generateDefaults, loading: tasksLoading, error: tasksError } = useTasksStore();

  const misc = useMiscStore(); // you mentioned stage gating here
  const [selectedUniversityId, setSelectedUniversityId] = useState("");

  const activeLock = useMemo(() => getActiveLock?.() || locks?.[0] || null, [getActiveLock, locks]);

  useEffect(() => {
    fetchShortlist?.().catch(() => {});
    fetchActiveLocks?.().catch(() => {});
  }, [fetchShortlist, fetchActiveLocks]);

  // Auto-select first shortlisted if none selected
  useEffect(() => {
    if (!selectedUniversityId && shortlistItems?.length) {
      setSelectedUniversityId(shortlistItems[0].universityId);
    }
  }, [shortlistItems, selectedUniversityId]);

  const canLock = Boolean(selectedUniversityId) && !activeLock;

  const handleLock = async () => {
    if (!selectedUniversityId) return;

    // If backend also auto-creates tasks, we set false here
    // because we generate tasks explicitly after lock success.
    const lock = await lockUniversity(selectedUniversityId, { autoCreateTasks: false });

    // stage gating (set stage to 4)
    // Your miscStore currently only has ping(), so this is guarded.
    try {
      misc?.setStage?.(4);
    } catch {
      // ignore if not implemented yet
    }

    // Generate default tasks for this lock
    // tasks.controller expects { lockId, universityId } :contentReference[oaicite:4]{index=4}
    await generateDefaults({ lockId: lock.id, universityId: lock.universityId });

    // Go to guidance page
    navigate("/guidance");
  };

  const handleUnlock = async () => {
    if (!activeLock?.id) return;
    await unlockUniversity(activeLock.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900">Lock your final university</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Locking unlocks application guidance + tasks. You can unlock later if needed.
          </p>
        </div>

        {activeLock ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Locked
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 text-zinc-800 px-3 py-1 text-sm font-medium">
            Step 4
          </span>
        )}
      </div>

      {/* Errors */}
      {(shortlistError || lockError || tasksError) && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {shortlistError && <div>Shortlist: {String(shortlistError)}</div>}
          {lockError && <div>Lock: {String(lockError)}</div>}
          {tasksError && <div>Tasks: {String(tasksError)}</div>}
        </div>
      )}

      {/* Active lock card */}
      {activeLock && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-600">Active lock</div>
              <div className="text-lg font-semibold text-zinc-900 mt-1">
                University ID: <span className="font-mono text-base">{activeLock.universityId}</span>
              </div>
              <div className="text-sm text-zinc-600 mt-1">
                Locked at: {activeLock.lockedAt ? new Date(activeLock.lockedAt).toLocaleString() : "—"}
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={lockLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            >
              {lockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
              Unlock
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-sm text-zinc-700">
            You can now go to <span className="font-semibold">Guidance</span> to follow tasks and deadlines.
          </div>

          <div className="mt-4">
            <button
              onClick={() => navigate("/guidance")}
              className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800"
            >
              Go to Guidance
            </button>
          </div>
        </div>
      )}

      {/* Shortlist picker + lock action */}
      {!activeLock && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm p-4 md:p-5">
          <div className="text-base font-semibold text-zinc-900">Pick from your shortlist</div>
          <div className="text-sm text-zinc-600 mt-1">
            You can only lock one when you’re ready to commit.
          </div>

          <div className="mt-4">
            {shortlistLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading shortlist…
              </div>
            ) : shortlistItems?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortlistItems.map((item) => {
                  const u = item.university; // included by shortlist.service.listMine :contentReference[oaicite:5]{index=5}
                  const isSelected = item.universityId === selectedUniversityId;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedUniversityId(item.universityId)}
                      className={clsx(
                        "text-left rounded-2xl border p-4 transition",
                        isSelected
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 hover:bg-zinc-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm text-zinc-600">
                            {item.bucket ? `Bucket: ${item.bucket}` : "Bucket: —"}
                          </div>
                          <div className="text-base font-semibold text-zinc-900 mt-1 truncate">
                            {u?.universityName || "University"}
                          </div>
                          <div className="text-sm text-zinc-600 mt-1 truncate">
                            {u?.city ? `${u.city}, ` : ""}
                            {u?.country || "—"}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white px-2 py-1 text-xs">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600">
                        <div className="rounded-xl bg-white border border-zinc-200 p-2">
                          Tuition: {u?.costCurrency ? `${u.costCurrency} ` : ""}{u?.tuition?.toLocaleString?.() ?? "—"}
                        </div>
                        <div className="rounded-xl bg-white border border-zinc-200 p-2">
                          Acceptance: {u?.acceptanceRate || "—"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-700">
                No shortlisted universities found. Go shortlist at least one first.
                <div className="mt-3">
                  <button
                    onClick={() => navigate("/shortlist")}
                    className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:bg-zinc-800"
                  >
                    Go to Shortlist
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleLock}
              disabled={!canLock || lockLoading || tasksLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {(lockLoading || tasksLoading) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Lock university
            </button>

            <button
              onClick={() => navigate("/shortlist")}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Back to shortlist
            </button>
          </div>

          <div className="mt-3 text-xs text-zinc-600">
            After locking, we’ll auto-create your application tasks (SOP, transcripts, LORs, exams, checklist).{" "}
            (Tasks are generated server-side via default templates.) 
          </div>
        </div>
      )}
    </div>
  );
}
