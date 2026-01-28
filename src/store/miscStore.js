import { create } from "zustand";
import { healthCheck } from "../services/api";

const useMiscStore = create((set) => ({
  health: null,
  loading: false,
  error: null,

  ping: async () => {
    set({ loading: true, error: null });
    try {
      const res = await healthCheck();
      set({ health: res.data });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Health check failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useMiscStore;
