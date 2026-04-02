import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthUser } from "../types/auth";

export async function getUser() {
  try {
    const cookeieStore = await cookies();
    const accessToken = cookeieStore.get("accessToken")?.value;
    if (!accessToken) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(accessToken, secret);
    return payload as AuthUser;
  } catch {
    return null;
  }
}
