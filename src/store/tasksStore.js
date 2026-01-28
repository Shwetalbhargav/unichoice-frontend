import { create } from "zustand";
import { listTasks, createTask, updateTask, generateDefaultTasks } from "../services/api";

const useTasksStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await listTasks(params);
      set({ items: res.data || [] });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "List tasks failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await createTask(payload);
      // if you pass lockId in payload, refresh for that lock
      if (payload?.lockId) await get().fetch({ lockId: payload.lockId });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Create task failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  update: async (taskId, payload, refetchParams) => {
    set({ loading: true, error: null });
    try {
      const res = await updateTask(taskId, payload);
      if (refetchParams) await get().fetch(refetchParams);
      else {
        // optimistic update fallback
        set((s) => ({
          items: s.items.map((t) => (t.id === taskId ? { ...t, ...payload } : t)),
        }));
      }
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Update task failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  generateDefaults: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await generateDefaultTasks(payload);
      if (payload?.lockId) await get().fetch({ lockId: payload.lockId });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Generate tasks failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ items: [] }),
}));

export default useTasksStore;
