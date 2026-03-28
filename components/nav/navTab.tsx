"use client";

import {
  House,
  Utensils,
  User,
  Menu,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function NavTabs() {
  const tabs = [
    { name: "Home", icon: House },
    { name: "Meals", icon: Utensils },
    { name: "Profile", icon: User },
  ];

  const moreItems = [
    { name: "Settings", icon: Settings },
    { name: "Notifications", icon: Bell },
    { name: "Help", icon: HelpCircle },
    { name: "Logout", icon: LogOut },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full border-t bg-white">
        <ul className="flex gap-2">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <li
                key={i}
                className="flex flex-col items-center justify-center flex-1 py-2"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.name}</span>
              </li>
            );
          })}
          <Drawer>
            <DrawerTrigger asChild>
              <li className="flex flex-col items-center justify-center flex-1 py-2">
                <Menu className="w-5 h-5" />
                <span className="text-xs">More</span>
              </li>
            </DrawerTrigger>

            <DrawerContent className="rounded-t-2xl">
              <DrawerTitle></DrawerTitle>
              <div className="grid grid-cols-4 py-2">
                {moreItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center py-2"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{item.name}</span>
                    </div>
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
