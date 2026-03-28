import Link from "next/link";
import {
  HousePlus,
  LogIn,
  Users,
  UtensilsCrossed,
  ReceiptText,
} from "lucide-react";
import MessigicianLogo from "@/components/svg/messigicianLogo";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";

const FEATURE_CARDS = [
  {
    icon: <Users className="w-5 h-5 text-success" />,
    label: "Manage members",
    bg: "bg-success-subtle",
    border: "border-success-border",
  },
  {
    icon: <UtensilsCrossed className="w-5 h-5 text-warning" />,
    label: "Track meals",
    bg: "bg-warning-subtle",
    border: "border-warning-border",
  },
  {
    icon: <ReceiptText className="w-5 h-5 text-danger" />,
    label: "Split bills",
    bg: "bg-danger-subtle",
    border: "border-danger-border",
  },
];

const LINK_BUTTON = [
  {
    icon: <HousePlus className="w-6 h-6 text-white" />,
    href: "/onboard/create",
    linkBgColor: "bg-brand-primary hover:bg-brand-primary-hover",
    linkIconBgColor: "bg-brand-primary-icon",
    linkTitle: "Create a mess",
    linkTitleSubText: "Start a new dining group",
  },
  {
    icon: <LogIn className="w-6 h-6 text-white" />,
    href: "/onboard/join",
    linkBgColor: "bg-brand-secondary hover:bg-brand-secondary-hover",
    linkIconBgColor: "bg-brand-secondary-icon",
    linkTitle: "Join a mess",
    linkTitleSubText: "Enter a code to join",
  },
];

export default function OnboardingPage() {
  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center ${SYSTEM_WIDE_PADDING} bg-background`}
    >
      <div className="flex items-center justify-center w-30 h-30 rounded-3xl bg-brand-primary-muted border border-brand-primary-border mb-2">
        <MessigicianLogo />
      </div>

      <h1 className="text-lg font-semibold text-foreground text-center leading-snug mb-2">
        Manage your hostel mess,
        <br />
        effortlessly.
      </h1>

      <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed mb-6">
        Create or join a mess to manage meals, members, and monthly expense —
        all in one place.
      </p>

      {/* feature cards */}
      <div className="flex gap-2 mb-8 w-full max-w-sm">
        {FEATURE_CARDS.map(({ icon, label, bg, border }) => (
          <div
            key={label}
            className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl border ${bg} ${border}`}
          >
            {icon}
            <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {LINK_BUTTON.map((li) => (
          <Link
            key={li.href}
            href={li.href}
            className={`flex items-center gap-4 px-5 py-4 ${li.linkBgColor} active:scale-[0.98] rounded-2xl transition-all duration-150`}
          >
            <div className={`p-2 ${li.linkIconBgColor} rounded-xl`}>
              {li.icon}
            </div>
            <div>
              <p className="text-white font-medium text-base leading-tight">
                {li.linkTitle}
              </p>
              <p className="text-white text-xs mt-0.5">{li.linkTitleSubText}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
