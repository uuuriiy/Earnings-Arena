import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { LaunchWizardApi } from "@/features/launch/hooks/useLaunchWizard";

export function LaunchStepper({
  steps,
  activeStep,
  address,
  goToStep,
}: Pick<LaunchWizardApi, "steps" | "activeStep" | "address" | "goToStep">) {
  return (
    <ol className="mt-4 flex flex-wrap gap-2">
      {steps.map((label, i) => {
        const done = i < activeStep;
        const current = i === activeStep;
        const clickable = i === 0 || (Boolean(address) && i <= activeStep);
        return (
          <li key={label}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!clickable}
              onClick={() => goToStep(i)}
              className={cn(
                "h-auto rounded-none border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em]",
                current && "border-primary bg-primary text-[#111] hover:bg-primary hover:text-[#111]",
                done && !current && "border-ok/50 text-ok hover:border-ok/50 hover:text-ok",
                !done && !current && "border-border text-muted-foreground",
                clickable ? "cursor-pointer" : "cursor-default opacity-60",
              )}
            >
              {done && !current ? "✓ " : `${i + 1}. `}
              {label}
            </Button>
          </li>
        );
      })}
    </ol>
  );
}
