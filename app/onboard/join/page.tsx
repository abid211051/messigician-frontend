import MessJoinForm from "@/components/messForms/messJoinFrom";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import MessigicianLogo from "@/components/svg/messigicianLogo";

export default function MessJoinPage() {
  return (
    <div
      className={`min-h-screen flex flex-col justify-center max-w-sm mx-auto w-full ${SYSTEM_WIDE_PADDING}`}
    >
      <div className="flex flex-col items-center pt-8 pb-6 gap-3">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-brand-primary-border">
          <MessigicianLogo variant="icon" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Join a mess</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Find your dining group and send a request
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-3">
        <MessJoinForm />
      </div>
    </div>
  );
}
