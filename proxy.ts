import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const memberPrivateRoutes = ["/users/member"];
const managerPrivateRoutes = ["/users/manager"];
const ownerPrivateRoutes = ["/users/owner"];
const publicRoutes = ["/"];
const noMessRoutes = ["/onboard", "/onboard/create", "/onboard/join"];

const isPrivate = (path: string) =>
  memberPrivateRoutes.includes(path) ||
  managerPrivateRoutes.includes(path) ||
  ownerPrivateRoutes.includes(path);

// ----- Verify access token ----------
async function verifyAccessToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// ----- Try refresh token ----------
async function tryRefresh(req: NextRequest) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") || "" },
      },
    );
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

// ----- Redirect based on role ----------
function redirectByMessRole(
  mess_role: string | null,
  reqPath: string,
  req: NextRequest,
): NextResponse | null {
  if (!mess_role) {
    return noMessRoutes.includes(reqPath)
      ? null
      : NextResponse.redirect(new URL("/onboard", req.url));
  }

  if (mess_role === "member") {
    return memberPrivateRoutes.includes(reqPath)
      ? null
      : NextResponse.redirect(new URL("/users/member", req.url));
  }
  if (mess_role === "manager") {
    return managerPrivateRoutes.includes(reqPath)
      ? null
      : NextResponse.redirect(new URL("/users/manager", req.url));
  }
  if (mess_role === "owner") {
    return ownerPrivateRoutes.includes(reqPath)
      ? null
      : NextResponse.redirect(new URL("/users/owner", req.url));
  }

  return null;
}

// ----- Forward cookies from Express response to browser ----------
function forwardCookies(from: Response, to: NextResponse) {
  from.headers.getSetCookie().forEach((cookie) => {
    to.headers.append("Set-Cookie", cookie);
  });
}

// ----- Main middleware ----------
export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const reqPath = req.nextUrl.pathname;

  // // Step 1: Valid access token → redirect by role
  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded) {
      const redirect = redirectByMessRole(
        decoded.mess_role as string | null,
        reqPath,
        req,
      );
      return redirect ?? NextResponse.next();
    }
  }

  // Step 2: No refresh token → redirect to public route
  if (!refreshToken) {
    return publicRoutes.includes(reqPath)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/", req.url));
  }

  // Step 3: Try refresh
  const refreshResponse = await tryRefresh(req);

  if (refreshResponse) {
    const resData = await refreshResponse.json();
    const redirect = redirectByMessRole(resData.mess_role, reqPath, req);
    const nextResponse = redirect ?? NextResponse.next();

    forwardCookies(refreshResponse, nextResponse);
    return nextResponse;
  }

  // Step 4: Refresh failed
  return isPrivate(reqPath)
    ? NextResponse.redirect(new URL("/", req.url))
    : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
