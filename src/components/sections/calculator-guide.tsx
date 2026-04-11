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
    description: "Enter the total milligrams (mg) for up to five Peptide vials.",
  },
  {
    step: "03",
    title: "Enter Bac Water Volume",
    description: "Specify the volume in milliliters (mL) or International Units (IU).",
  },
  {
    step: "04",
    title: "Specify Peptide Dose",
    description: "Input the required dosage in milligrams (mg) or micrograms (mcg).",
  },
  {
    step: "05",
    title: "View Calculation Results",
    description: "The results of your inputs will be displayed for your review.",
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
          <span className="pointer-events-none absolute -left-1 top-1/2 -translate-y-1/2 text-[140px] font-black leading-none text-slate-200/60 dark:text-slate-700/40">
            {item.step}
          </span>
          <div className="relative text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
              {item.title}
            </h3>
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
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
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
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <span>How to Use the Peptide Calculator</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
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
