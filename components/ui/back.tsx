"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-card"
    >
      <ChevronLeft className="w-5 h-5 text-gray-700" />
    </button>
  );
}
