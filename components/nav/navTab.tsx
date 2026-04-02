"use client";

import { House, Utensils, User, Menu, UserRoundPlus } from "lucide-react";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuthStore } from "@/lib/stores/auth.store";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Always keep at most 3 items in the main tab, rest goes to more
const TAB_CONFIG = {
  owner: {
    main: [
      { name: "Home", icon: House, href: "/users/owner" },
      { name: "Meals", icon: Utensils, href: "/users/owner/meals" },
      { name: "Members", icon: User, href: "/users/owner/members" },
    ],
    more: [
      { name: "Profile", icon: User, href: "/users/owner/profile" },
      {
        name: "Request",
        icon: UserRoundPlus,
        href: "/users/owner/join-request",
      },
    ],
  },
  manager: {
    main: [
      { name: "Home", icon: House, href: "/users/manager" },
      { name: "Meals", icon: Utensils, href: "/users/manager/meals" },
      { name: "Profile", icon: User, href: "/users/manager/profile" },
    ],
    more: [],
  },
  member: {
    main: [
      { name: "Home", icon: House, href: "/users/member" },
      { name: "Meals", icon: Utensils, href: "/users/member/meals" },
      { name: "Profile", icon: User, href: "/users/member/profile" },
    ],
    more: [],
  },
};

export default function NavTabs() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const role = user?.mess_role ?? "member";
  const mainTabs = TAB_CONFIG[role].main;
  const moreTabs = TAB_CONFIG[role].more;

  const isActive = (href: string) => pathname === href;
  return (
    <>
      <nav className="py-1 fixed bottom-0 left-0 w-full border-t bg-white">
        <ul className="flex justify-around gap-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                href={tab.href}
                key={tab.name}
                className={`flex ${isActive(tab.href) ? "text-brand-primary scale-110" : ""} flex-col items-center justify-center flex-1 py-2`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.name}</span>
              </Link>
            );
          })}
          <Drawer>
            <DrawerTrigger
              className="flex flex-col items-center justify-center flex-1 py-2"
              asChild
            >
              <div>
                <Menu className="w-5 h-5" />
                <span className="text-xs">More</span>
              </div>
            </DrawerTrigger>

            <DrawerContent className="rounded-t-2xl">
              <DrawerTitle aria-describedby="more"></DrawerTitle>
              <div className="grid grid-cols-4 py-2">
                {moreTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      href={tab.href}
                      key={tab.name}
                      className={`flex ${isActive(tab.href) ? "text-brand-primary scale-110" : ""} flex-col items-center justify-center flex-1 py-2`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{tab.name}</span>
                    </Link>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </ul>
      </nav>
    </>
  );
}
