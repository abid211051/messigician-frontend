"use client";
import { getAvatarColor, getInitials } from "@/lib/helpers/avatar";
import {
  Mail,
  Phone,
  Clock,
  UserCircle,
  Building2,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock data
const mockRequests = [
  {
    id: 1,
    name: "John Michael Anderson",
    email: "john.anderson@gmail.com",
    phone: "+1 (555) 123-4567",
    requestedAt: "2 hours ago",
    image: null,
    submess: "Marketing Team",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "-",
    requestedAt: "5 hours ago",
    image: null,
    submess: "Design Department",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "m.chen.very.long.email@company.domain.com",
    phone: "+1 (555) 987-6543",
    requestedAt: "1 day ago",
    image: null,
    submess: "Engineering",
  },
];

export default function JoinRequestPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const handleAccept = (id: number) => {
    console.log("Accept:", id);
  };

  const handleReject = (id: number) => {
    console.log("Reject:", id);
  };

  return (
    <div className="min-h-screen bg-white pb-20 p-3">
      {/* ── Header ── */}
      <div className="relative flex items-center justify-center py-2 mb-3">
        {/* Back button – always top-left */}
        <button
          onClick={() => router.back()}
          className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Title – always centred */}
        <h1 className="text-lg font-bold text-gray-900">Join Requests</h1>

        {/* 
          Example right action (uncomment when needed):
          <button className="absolute right-0 ...">...</button>
        */}
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {["all", "today", "week"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === item
                ? "bg-brand-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {item === "all" ? "All" : item === "today" ? "Today" : "This Week"}
          </button>
        ))}
      </div>

      {/* ── Request List ── */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <UserCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No pending requests
            </h3>
            <p className="text-sm text-gray-500">
              New join requests will appear here
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-100 rounded-xl  overflow-hidden"
              // ↑ Removed hover:shadow-md – cards no longer lift on hover
            >
              {/* Card Content */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      request.name,
                    )} flex items-center justify-center text-white font-semibold text-lg shrink-0 overflow-clip`}
                  >
                    {request.image ? (
                      <Image
                        src={"/"}
                        alt=""
                        width={100}
                        height={100}
                        className="w-full h-full"
                      />
                    ) : (
                      getInitials(request.name)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {request.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{request.requestedAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{request.submess}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600 truncate">
                      {request.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-600">
                      {request.phone || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-white">
                <button
                  onClick={() => handleReject(request.id)}
                  className="flex-1 py-3 text-sm font-semibold text-destructive transition active:scale-95"
                >
                  Reject
                </button>
                <div className="w-px bg-white" />
                <button
                  onClick={() => handleAccept(request.id)}
                  className="flex-1 py-3 text-sm font-semibold text-secondary transition active:scale-95"
                >
                  Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
