import { create } from "zustand";
import { sendOtp, verifyOtp, getMe } from "../services/api";

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,
  loading: false,
  error: null,

  isAuthed: () => Boolean(get().token),

  sendOtp: async (payload) => {
    set({ loading: true, error: null });
    try {
      await sendOtp(payload);
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Failed to send OTP" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await verifyOtp(payload);
      const token = res.data.token;
      localStorage.setItem("token", token);
      set({ token });
      await get().fetchMe();
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "OTP verify failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getMe();
      set({ user: res.data });
      return res.data;
    } catch (e) {
      set({ error: e?.response?.data || e?.message || "Fetch me failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
