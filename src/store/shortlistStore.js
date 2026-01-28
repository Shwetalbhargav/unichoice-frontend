import { create } from "zustand";
import {
  listMyShortlist,
  addOrUpdateShortlist,
  removeFromShortlist,
  shortlistRecommendations,
} from "../services/api";

const useShortlistStore = create((set) => ({
  items: [],
  recommendations: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const res = await listMyShortlist();
      set({ items: res.data || [] });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Fetch shortlist failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  upsert: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await addOrUpdateShortlist(payload);
      // safest: refetch to stay consistent
      await useShortlistStore.getState().fetch();
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Update shortlist failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  remove: async (universityId) => {
    set({ loading: true, error: null });
    try {
      const res = await removeFromShortlist(universityId);
      set((s) => ({ items: s.items.filter((x) => x.universityId !== universityId) }));
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Remove shortlist failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchRecommendations: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await shortlistRecommendations(params);
      set({ recommendations: res.data || [] });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Shortlist recs failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ items: [], recommendations: [] }),
}));

export default useShortlistStore;
