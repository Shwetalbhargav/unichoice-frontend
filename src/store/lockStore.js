import { create } from "zustand";
import {
  getActiveLocks,
  lockUniversity as lockUniversityApi,
  unlockUniversity as unlockUniversityApi,
} from "../services/api";

/**
 * Lock Store
 * - Reflects LockedUniversity table
 * - Backend already enforces:
 *   - onboarding complete
 *   - university exists
 *   - optional task auto-generation
 */
const useLockStore = create((set, get) => ({
  locks: [],            // active locks only
  loading: false,
  error: null,

  /**
   * Fetch active locks for current user
   */
  fetchActiveLocks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getActiveLocks();
      // backend returns { success, data }
      set({ locks: res.data?.data || [] });
      return res.data?.data || [];
    } catch (e) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch locks",
      });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Lock a university
   * @param {string} universityId
   * @param {object} options { autoCreateTasks?: boolean }
   */
  lockUniversity: async (universityId, options = {}) => {
    if (!universityId) {
      throw new Error("universityId is required to lock");
    }

    set({ loading: true, error: null });

    try {
      const res = await lockUniversityApi({
        universityId,
        autoCreateTasks: options.autoCreateTasks ?? true,
      });

      const lock = res.data?.data;

      // optimistic: add to locks if not present
      set((state) => {
        const exists = state.locks.some((l) => l.id === lock.id);
        return exists
          ? state
          : { locks: [lock, ...state.locks] };
      });

      return lock;
    } catch (e) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Lock university failed",
      });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Unlock a university by lockId
   */
  unlockUniversity: async (lockId) => {
    if (!lockId) {
      throw new Error("lockId is required to unlock");
    }

    set({ loading: true, error: null });

    try {
      const res = await unlockUniversityApi(lockId);
      const updated = res.data?.data;

      set((state) => ({
        locks: state.locks.filter((l) => l.id !== lockId),
      }));

      return updated;
    } catch (e) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Unlock failed",
      });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Convenience helpers (used by stageStore)
   */
  hasLock: () => {
    return get().locks.length > 0;
  },

  getActiveLock: () => {
    return get().locks[0] || null;
  },

  clear: () => set({ locks: [], error: null }),
}));

export default useLockStore;
