import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const LG_BREAKPOINT = 1024;

const STEPS = [
  {
    step: "01",
    title: "Select Syringe Volume",
    description: "Choose from 0.3 mL, 0.5 mL, or 1 mL.",
  },
  {
    step: "02",
    title: "Input Peptide Quantity",
    description:
      "Enter the total milligrams (mg) for up to five Peptide vials.",
  },
  {
    step: "03",
    title: "Enter Bac Water Volume",
    description:
      "Specify the volume in milliliters (mL) or International Units (IU).",
  },
  {
    step: "04",
    title: "Specify Peptide Dose",
    description:
      "Input the required dosage in milligrams (mg) or micrograms (mcg).",
  },
  {
    step: "05",
    title: "View Calculation Results",
    description:
      "The results of your inputs will be displayed for your review.",
  },
];

function StepCards() {
  return (
    <div className="space-y-3">
      {STEPS.map((item) => (
        <div
          key={item.step}
          className="bg-card border-border/50 relative overflow-hidden rounded-2xl border p-6"
        >
          <span className="text-muted/60 dark:text-muted/30 pointer-events-none absolute -left-1 top-1/2 -translate-y-1/2 text-[140px] font-black leading-none">
            {item.step}
          </span>
          <div className="relative text-center">
            <h3 className="text-foreground text-lg font-bold">{item.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalculatorGuide() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
    check();
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  // PC: always show steps, no collapsible
  if (isDesktop) {
    return (
      <div className="w-full">
        <h2 className="text-foreground2 mb-4 text-sm font-semibold">
          How to Use the Peptide Calculator
        </h2>
        <StepCards />
      </div>
    );
  }

  // Mobile: collapsible, default closed
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="border-border bg-card text-foreground2 hover:bg-muted flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
      >
        <span>How to Use the Peptide Calculator</span>
        {open ? (
          <ChevronUp className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="animate-in fade-in mt-3 duration-200">
          <StepCards />
        </div>
      )}
    </div>
  );
}
