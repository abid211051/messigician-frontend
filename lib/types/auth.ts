export type AuthUser = {
  id: string;
  email: string;
  mess_id: string;
  mess_role: "owner" | "manager" | "member" | null;
};

export type AuthStore = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};
