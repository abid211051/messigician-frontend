// AuthComponent.tsx
"use client";
import { useEffect } from "react";
import api from "@/lib/axios";

export default function AuthComponent() {
  // useEffect(() => {
  //   api
  //     .get("/auth/test")
  //     .then((res) => console.log(res.data))
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <div className="min-w-screen min-h-screen flex items-center justify-center bg-orange-300">
      <a href="http://localhost:4000/v1/auth/google">Continue with google</a>
    </div>
  );
}
