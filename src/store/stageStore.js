import { create } from "zustand";
import useAuthStore from "./authStore";
import useOnboardingStore from "./onboardingStore";
import useLockStore from "./lockStore";

export const STAGES = {
  LANDING: 0,
  ONBOARDING: 1,
  DASHBOARD: 2,
  COUNSELLOR: 3,
  SHORTLISTING: 4,
  LOCKING: 5,
  APPLICATION: 6,
};

const useStageStore = create((set, get) => ({
  stage: STAGES.LANDING,

  computeStage: () => {
    const { token } = useAuthStore.getState();
    const onboardingComplete = useOnboardingStore.getState().isComplete();
    const hasLock = useLockStore.getState().hasLock();

    if (!token) return STAGES.LANDING;
    if (!onboardingComplete) return STAGES.ONBOARDING;
    if (!hasLock) return STAGES.SHORTLISTING;
    return STAGES.APPLICATION;
  },

  sync: () => {
    set({ stage: get().computeStage() });
  },

  setStage: (stage) => set({ stage }),
}));

export default useStageStore;
