import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/"];
const noMessRoutes = ["/onboard", "/onboard/create", "/onboard/join"];
const ROLE_BASED_ROUTES = {
  owner: "/users/owner",
  manager: "/users/manager",
  member: "/users/member",
} as const;

const isPrivate = (path: string) =>
  path.startsWith("/users") || path.startsWith("/onboard");

async function verifyAccessToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

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

function getRouteRedirect(
  mess_role: string | null,
  reqPath: string,
  req: NextRequest,
): NextResponse | null {
  if (!mess_role) {
    return noMessRoutes.includes(reqPath)
      ? null
      : NextResponse.redirect(new URL("/onboard", req.url));
  }

  const basePath =
    ROLE_BASED_ROUTES[mess_role as keyof typeof ROLE_BASED_ROUTES];

  // ✅ Authenticated users should never see the public/landing route
  if (publicRoutes.includes(reqPath)) {
    return NextResponse.redirect(new URL(basePath, req.url));
  }

  if (noMessRoutes.includes(reqPath)) {
    return NextResponse.redirect(new URL(basePath, req.url));
  }

  if (isPrivate(reqPath) && !reqPath.startsWith(basePath)) {
    return NextResponse.redirect(new URL(basePath, req.url));
  }

  return null;
}

function forwardCookies(from: Response, to: NextResponse) {
  from.headers.getSetCookie().forEach((cookie) => {
    to.headers.append("Set-Cookie", cookie);
  });
}

// Extract cookie value by name from a Set-Cookie header array
function extractCookieValue(
  setCookieHeaders: string[],
  name: string,
): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`^${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const reqPath = req.nextUrl.pathname;

  // Step 1: Valid access token → check route, stay on current path
  if (accessToken) {
    const decoded = await verifyAccessToken(accessToken);
    if (decoded) {
      const redirect = getRouteRedirect(
        decoded.mess_role as string | null,
        reqPath,
        req,
      );
      return redirect ?? NextResponse.next();
    }
  }

  // Step 2: No refresh token → only public routes allowed
  if (!refreshToken) {
    return publicRoutes.includes(reqPath)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/", req.url));
  }

  // Step 3: Expired access token + refresh token exists → try refresh
  const refreshResponse = await tryRefresh(req);

  if (refreshResponse) {
    const setCookieHeaders = refreshResponse.headers.getSetCookie();
    const newAccessToken = extractCookieValue(setCookieHeaders, "accessToken");

    // Verify the new token directly so we don't rely on resData shape
    // and get the role from the token itself (source of truth)
    let mess_role: string | null = null;

    if (newAccessToken) {
      const decoded = await verifyAccessToken(newAccessToken);
      mess_role = (decoded?.mess_role as string) ?? null;
    } else {
      // Fallback to response body if cookie extraction fails
      const resData = await refreshResponse.json();
      mess_role = resData.mess_role ?? null;
    }

    const redirect = getRouteRedirect(mess_role, reqPath, req);

    // KEY FIX: if no redirect needed, let user through to THEIR intended route
    // and forward the new cookies to the browser
    const nextResponse = redirect ?? NextResponse.next();
    forwardCookies(refreshResponse, nextResponse);
    return nextResponse;
  }

  // Step 4: Refresh failed → send unauthenticated users to public route
  return isPrivate(reqPath)
    ? NextResponse.redirect(new URL("/", req.url))
    : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
