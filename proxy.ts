import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const userPrivateRoutes = ["/user/profile"];
const adminPrivateRoutes = ["/admin/profile"];
const publicRoutes = ["/"];

const isPrivate = (path: string) =>
  userPrivateRoutes.includes(path) || adminPrivateRoutes.includes(path);

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
function redirectByRole(role: string, reqPath: string, req: NextRequest) {
  if (role === "user" && !userPrivateRoutes.includes(reqPath)) {
    return NextResponse.redirect(new URL("/user/profile", req.url));
  }
  if (role === "admin" && !adminPrivateRoutes.includes(reqPath)) {
    return NextResponse.redirect(new URL("/admin/profile", req.url));
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
  return NextResponse.next();
  // const accessToken = req.cookies.get("accessToken")?.value;
  // const refreshToken = req.cookies.get("refreshToken")?.value;
  // const reqPath = req.nextUrl.pathname;

  // // Step 1: Valid access token → redirect by role
  // if (accessToken) {
  //   const decoded = await verifyAccessToken(accessToken);
  //   if (decoded) {
  //     return (
  //       redirectByRole(decoded.role as string, reqPath, req) ??
  //       NextResponse.next()
  //     );
  //   }
  // }

  // // Step 2: No refresh token → redirect to public route
  // if (!refreshToken) {
  //   return publicRoutes.includes(reqPath)
  //     ? NextResponse.next()
  //     : NextResponse.redirect(new URL("/", req.url));
  // }

  // // Step 3: Try refresh
  // const refreshResponse = await tryRefresh(req);

  // if (refreshResponse) {
  //   const resData = await refreshResponse.json();
  //   const nextResponse =
  //     redirectByRole(resData.role, reqPath, req) ?? NextResponse.next();

  //   forwardCookies(refreshResponse, nextResponse);
  //   return nextResponse;
  // }

  // // Step 4: Refresh failed
  // return isPrivate(reqPath)
  //   ? NextResponse.redirect(new URL("/", req.url))
  //   : NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
