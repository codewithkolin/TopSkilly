// Zustand global state store
import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AppState {
  user: User | null;
  userRole: "student" | "professional" | "admin" | null;
  coinBalance: number;
  setUser: (user: User | null) => void;
  setUserRole: (role: AppState["userRole"]) => void;
  setCoinBalance: (balance: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  userRole: null,
  coinBalance: 0,
  setUser: (user) => set({ user }),
  setUserRole: (userRole) => set({ userRole }),
  setCoinBalance: (coinBalance) => set({ coinBalance }),
  reset: () => set({ user: null, userRole: null, coinBalance: 0 }),
}));
