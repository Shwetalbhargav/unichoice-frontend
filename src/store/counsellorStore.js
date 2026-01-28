import { create } from "zustand";
import {
  counsellorStatus,
  courseOptions,
  selectCourse,
  counsellorRecommendations,
  counsellorOneClickShortlist,
  counsellorOneClickLock,
} from "../services/api";

import useShortlistStore from "./shortlistStore";
import useLockStore from "./lockStore";

const useCounsellorStore = create((set) => ({
  status: null,
  courses: [],
  recommendations: null,

  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true, error: null });
    try {
      const res = await counsellorStatus();
      set({ status: res.data });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Counsellor status failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const res = await courseOptions();
      set({ courses: res.data || [] });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Courses failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  chooseCourse: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await selectCourse(payload);
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Select course failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchRecommendations: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await counsellorRecommendations(params);
      set({ recommendations: res.data });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Counsellor recs failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  oneClickShortlist: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await counsellorOneClickShortlist(payload);
      // keep UI in sync
      await useShortlistStore.getState().fetch();
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "One-click shortlist failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  oneClickLock: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await counsellorOneClickLock(payload);
      await useLockStore.getState().fetchLocks();
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "One-click lock failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ status: null, courses: [], recommendations: null }),
}));

export default useCounsellorStore;
