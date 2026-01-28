import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // network / server down
    if (!err.response) {
      return Promise.reject({
        message: "Network error / server unreachable",
        original: err,
      });
    }

    // auth expired
    if (err.response.status === 401) {
      clearAuthToken();
    }

    return Promise.reject(err);
  }
);

// ---- Auth (1–3)
export const sendOtp = (payload) => api.post("/auth/send-otp", payload);
export const verifyOtp = (payload) => api.post("/auth/verify-otp", payload);
export const getMe = () => api.get("/api/users/me");

// ---- Onboarding (4–5)
export const getMyOnboarding = () => api.get("/api/onboarding/me");
export const saveOnboarding = (payload) => api.post("/api/onboarding", payload);

// ---- Universities (6–8)
export const searchUniversities = (params) =>
  api.get("/api/universities/search", { params });
export const universitiesFromOnboarding = (params) =>
  api.get("/api/universities/from-onboarding", { params });
export const getUniversityById = (universityId) =>
  api.get(`/api/universities/${universityId}`);

// ---- Shortlist (9–12)
export const listMyShortlist = () => api.get("/api/shortlist");
export const addOrUpdateShortlist = (payload) => api.post("/api/shortlist", payload);
export const removeFromShortlist = (universityId) =>
  api.delete(`/api/shortlist/${universityId}`);
export const shortlistRecommendations = (params) =>
  api.get("/api/shortlist/recommendations", { params });

// ---- Lock (13–15)
export const getActiveLocks = () => api.get("/api/lock");
export const lockUniversity = (payload) => api.post("/api/lock", payload);
export const unlockUniversity = (lockId) => api.post(`/api/lock/${lockId}/unlock`);

// ---- Tasks (16–19)
export const listTasks = (params) => api.get("/api/tasks", { params });
export const createTask = (payload) => api.post("/api/tasks", payload);
export const updateTask = (taskId, payload) => api.patch(`/api/tasks/${taskId}`, payload);
export const generateDefaultTasks = (payload) => api.post("/api/tasks/generate", payload);

// ---- Counsellor (20–25)
export const counsellorStatus = () => api.get("/api/counsellor/status");
export const courseOptions = () => api.get("/api/counsellor/courses");
export const selectCourse = (payload) => api.post("/api/counsellor/courses/select", payload);
export const counsellorRecommendations = (params) =>
  api.get("/api/counsellor/recommendations", { params });
export const counsellorOneClickShortlist = (payload) => api.post("/api/counsellor/shortlist", payload);
export const counsellorOneClickLock = (payload) => api.post("/api/counsellor/lock", payload);

// ---- Misc
export const healthCheck = () => api.get("/health");

export default api;
