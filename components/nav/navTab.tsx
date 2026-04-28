"use client";

import { House, BookUser, Grid2X2, Menu, IdCard, Utensils } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuthStore } from "@/lib/stores/auth.store";
import Link from "next/link";
import { usePathname } from "next/navigation";

const getTabConfig = (messId: string) => ({
  owner: {
    main: [
      { name: "Home", icon: House, href: "/users/owner" },
      { name: "Tenants", icon: BookUser, href: "/users/owner/tenants" },
      { name: "Sub-Mess", icon: Grid2X2, href: "/users/owner/subMess" },
    ],
    more: [
      {
        name: "Request",
        icon: IdCard,
        href: `/users/owner/join-request`,
      },
    ],
  },
  manager: {
    main: [
      { name: "Home", icon: House, href: "/users/manager" },
      { name: "Meals", icon: Utensils, href: "/users/manager/meals" },
    ],
    more: [],
  },
  member: {
    main: [
      { name: "Home", icon: House, href: "/users/member" },
      { name: "Meals", icon: Utensils, href: "/users/member/meals" },
    ],
    more: [],
  },
});

const tabItemClass = (active: boolean) =>
  `flex flex-col items-center justify-center gap-0.5 h-16 px-1 w-full active:scale-95 transition-transform
   ${active ? "text-brand-primary border-t-2 border-t-brand-primary" : ""}`;

export default function NavTabs() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const role = user?.mess_role ?? "member";
  const messId = user?.mess_id ?? "";

  const TAB_CONFIG = getTabConfig(messId);
  const mainTabs = TAB_CONFIG[role].main;
  const moreTabs = TAB_CONFIG[role].more;

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="z-999 fixed bottom-0 left-0 w-full border-t bg-card">
      <ul className="grid grid-cols-4">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              href={tab.href}
              key={tab.name}
              className={tabItemClass(isActive(tab.href))}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="w-full text-[11px] text-center truncate">
                {tab.name}
              </span>
            </Link>
          );
        })}

        <Drawer>
          <DrawerTrigger className={tabItemClass(false)}>
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[11px] text-center">More</span>
          </DrawerTrigger>
          <DrawerContent className="bg-card rounded-t-2xl">
            <DrawerTitle aria-describedby="more" />
            <div className="grid grid-cols-4 py-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    href={tab.href}
                    key={tab.name}
                    className={`flex flex-col items-center justify-center gap-0.5 py-3 active:scale-95 ${isActive(tab.href) ? "text-brand-primary" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] text-center truncate">
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
      </ul>
    </nav>
  );
}
