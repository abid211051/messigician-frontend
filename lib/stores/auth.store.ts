import { create } from "zustand";
import { AuthStore } from "@/lib/types/auth";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
