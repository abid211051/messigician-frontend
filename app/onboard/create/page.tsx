import MessCreationForm from "@/components/messForms/messCreateForm";
import { SYSTEM_WIDE_PADDING } from "@/lib/constants";
import MessigicianLogo from "@/components/svg/messigicianLogo";

export default function MessCreationPage() {
  return (
    <div
      className={`min-h-screen bg-background flex flex-col justify-center max-w-sm mx-auto w-full ${SYSTEM_WIDE_PADDING}`}
    >
      <div className="flex flex-col items-center pt-8 pb-6 gap-3">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-primary-muted border border-brand-primary-border">
          <MessigicianLogo variant="icon" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Create your mess
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set up your dining group in seconds
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <MessCreationForm />
      </div>
    </div>
  );
}
