// app/(mess)/components/nav-tabs.tsx
"use client";

import { useTransition } from "react";
import {
  House,
  BookUser,
  Grid2X2,
  Menu,
  IdCard,
  Utensils,
  LogOut,
} from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/stores/auth.store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DESKTOP_MAX_TABS, MOBILE_MAX_TABS } from "@/lib/constants";

// Placeholder for your logout action
const logoutServerAction = async () => {};

interface TabItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const ownerMessTabs = (messId: string): TabItem[] => [
  { name: "Home", icon: House, href: "/users/owner" },
  { name: "Tenants", icon: BookUser, href: "/users/owner/tenants" },
  { name: "Sub-Mess", icon: Grid2X2, href: "/users/owner/subMess" },
  { name: "Request", icon: IdCard, href: "/users/owner/join-request" },
];

const ownerSubMessTabs = (subMessId: string): TabItem[] => [
  { name: "Home", icon: House, href: `/users/owner/subMess/${subMessId}` },
  {
    name: "Meals",
    icon: Utensils,
    href: `/users/owner/subMess/${subMessId}/meals`,
  },
];

const managerTabs = (): TabItem[] => [
  { name: "Home", icon: House, href: "/users/manager" },
  { name: "Meals", icon: Utensils, href: "/users/manager/meals" },
];

const memberTabs = (): TabItem[] => [
  { name: "Home", icon: House, href: "/users/member" },
  { name: "Meals", icon: Utensils, href: "/users/member/meals" },
];

const SUB_MESS_PANEL_RE = /^\/users\/owner\/subMess\/([^/]+)/;

function useTabConfig(
  role: string,
  messId: string,
  pathname: string,
): TabItem[] {
  if (role === "owner") {
    const match = pathname.match(SUB_MESS_PANEL_RE);
    if (match) return ownerSubMessTabs(match[1]);
    return ownerMessTabs(messId);
  }
  if (role === "manager") return managerTabs();
  return memberTabs();
}

export default function NavTabs() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => (s as any).clearAuth);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const role = user?.mess_role ?? "member";
  const messId = user?.mess_id ?? "";

  const allTabs = useTabConfig(role, messId, pathname);
  const isActive = (href: string) => pathname === href;

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 h-14 px-1 w-full
     active:scale-95 transition-transform text-center
     ${active ? "text-brand-primary border-t-2 border-t-brand-primary" : "text-gray-500"}`;

  const handleLogout = () => {
    if (isPending) return;
    startTransition(async () => {
      await fetch("/api/logout", {
        method: "POST",
      });
      clearAuth();
      router.push("/");
      router.refresh();
    });
  };

  const visibleMobileTabs = allTabs.slice(0, MOBILE_MAX_TABS);
  const hiddenMobileTabs = allTabs.slice(MOBILE_MAX_TABS);
  const mobileColCount = visibleMobileTabs.length + 1;

  const visibleDesktopTabs = allTabs.slice(0, DESKTOP_MAX_TABS);
  const hiddenDesktopTabs = allTabs.slice(DESKTOP_MAX_TABS);
  const hasDesktopMore = hiddenDesktopTabs.length > 0;
  const desktopColCount =
    visibleDesktopTabs.length + (hasDesktopMore ? 1 : 0) + 1;

  return (
    <nav className="z-30 fixed bottom-0 left-0 w-full border-t bg-card shadow-lg">
      <ul
        className="sm:hidden grid items-center w-full"
        style={{
          gridTemplateColumns: `repeat(${mobileColCount}, minmax(0, 1fr))`,
        }}
      >
        {visibleMobileTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={tabClass(isActive(tab.href))}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="w-full text-[11px] truncate px-0.5">
                {tab.name}
              </span>
            </Link>
          );
        })}

        <Drawer>
          <DrawerTrigger className={tabClass(false)}>
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[11px]">More</span>
          </DrawerTrigger>
          <DrawerContent className="bg-card rounded-t-2xl p-2 max-h-[85vh] flex flex-col">
            <DrawerTitle className="sr-only">Menu</DrawerTitle>
            <DrawerDescription className="sr-only">
              Additional application management panels.
            </DrawerDescription>

            {hiddenMobileTabs.length > 0 && (
              <div className="grid grid-cols-4 gap-y-2 py-2 border-b border-gray-100 overflow-y-auto">
                {hiddenMobileTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform ${
                        isActive(tab.href)
                          ? "text-brand-primary font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${isActive(tab.href) ? "bg-blue-50" : "bg-gray-50"}`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <span className="w-full text-[11px] text-center truncate px-1">
                        {tab.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl mt-4 shrink-0"
            >
              <LogOut className="w-5 h-5" />
              <span>{isPending ? "Logging out..." : "Logout"}</span>
            </Button>
          </DrawerContent>
        </Drawer>
      </ul>

      <ul
        className="hidden sm:grid items-center w-full max-w-xl mx-auto px-4"
        style={{
          gridTemplateColumns: `repeat(${desktopColCount}, minmax(0, 1fr))`,
        }}
      >
        {visibleDesktopTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={tabClass(isActive(tab.href))}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="w-full text-[11px] truncate px-1">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* 2. Desktop Overflow Drawer */}
        {hasDesktopMore && (
          <Drawer>
            <DrawerTrigger className={tabClass(false)}>
              <Menu className="w-5 h-5 shrink-0" />
              <span className="text-[11px]">More</span>
            </DrawerTrigger>

            <DrawerContent className="bg-card rounded-t-2xl p-2 max-h-[85vh] flex flex-col">
              <DrawerTitle className="text-sm font-bold text-gray-700 mb-2 px-1">
                More Options
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                Desktop view overflow control pane.
              </DrawerDescription>

              <div className="grid grid-cols-4 gap-y-3 py-4 overflow-y-auto">
                {hiddenDesktopTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl active:scale-95 transition-all ${
                        isActive(tab.href)
                          ? "text-brand-primary font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          isActive(tab.href) ? "bg-blue-50" : "bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <span className="w-full text-[11px] text-center truncate px-1">
                        {tab.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        )}

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex flex-col items-center justify-center gap-0.5 py-2 h-14 px-1 w-full text-red-500 hover:text-red-600 font-medium active:scale-95 transition-transform disabled:opacity-50"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="w-full text-[11px] truncate px-1">
            {isPending ? "Leaving..." : "Logout"}
          </span>
        </button>
      </ul>
    </nav>
  );
}
