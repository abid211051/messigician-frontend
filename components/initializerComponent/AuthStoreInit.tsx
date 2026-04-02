"use client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useRef } from "react";
import { AuthUser } from "@/lib/types/auth";

export const AuthStoreinit = ({ user }: { user: AuthUser | null }) => {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAuthStore.setState({ user });
    initialized.current = true;
  }

  return null;
};
