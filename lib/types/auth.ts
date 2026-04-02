export type AuthUser = {
  id: string;
  email: string;
  role: string;
  mess_role: "owner" | "manager" | "member" | null;
};

export type AuthStore = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};
