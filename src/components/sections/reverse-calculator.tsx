import { useState, useCallback, useMemo, useEffect, useRef, useTransition } from "react";
import { HelpCircle, Beaker, Droplets, Syringe, FlaskConical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function HelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function smartStep(current: number, mode: "small" | "large" = "small"): number {
  const v = Math.abs(current);
  if (mode === "large") {
    if (v < 10) return 1;
    if (v < 100) return 10;
    if (v < 1000) return 50;
    return 100;
  }
  if (v < 1) return 0.1;
  if (v < 10) return 0.5;
  return 1;
}

function NumberInput({
  value,
  onChange,
  stepMode = "small",
  min = 0,
  suffix,
  className,
}: {
  value: number | string;
  onChange: (val: string) => void;
  stepMode?: "small" | "large";
  min?: number;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(String(value));
  const [, startTransition] = useTransition();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  const clamp = (n: number) => Math.max(min, parseFloat(n.toFixed(10)));
  const format = (n: number) => parseFloat(n.toFixed(4)).toString();

  const step = (dir: 1 | -1) => {
    setDisplay((prev) => {
      const cur = Number(prev) || 0;
      const next = format(clamp(cur + dir * smartStep(cur, stepMode)));
      startTransition(() => onChangeRef.current(next));
      return next;
    });
  };

  return (
    <div className={cn("flex items-center", className)}>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => step(-1)}
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] active:bg-[#1d4ed8]/20"
      >
        −
      </button>
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) {
              setDisplay(v);
              startTransition(() => onChangeRef.current(v));
            }
          }}
          onBlur={(e) => {
            const n = parseFloat(e.target.value);
            const val = String(isNaN(n) ? min : clamp(n));
            setDisplay(val);
            onChangeRef.current(val);
          }}
          className="h-12 w-full border-y border-slate-200 bg-[#1e3a5f]/5 text-center text-lg font-bold text-slate-800 outline-none selection:bg-[#3b82f6]/30 focus:border-[#3b82f6] focus:bg-white dark:text-white"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] active:bg-[#1d4ed8]/20"
      >
        +
      </button>
    </div>
  );
}

export function ReverseCalculator() {
  const [peptideVial, setPeptideVial] = useState<number | string>(5);
  const [dosage, setDosage] = useState<number | string>(250);
  const [desiredUnits, setDesiredUnits] = useState<number | string>(100);

  const result = useMemo(() => {
    const vialMg = Number(peptideVial) || 0;
    const doseMcg = Number(dosage) || 0;
    const units = Number(desiredUnits) || 0;

    if (vialMg <= 0 || doseMcg <= 0 || units <= 0) return null;

    // doseMcg per unit => doseMcg / units
    // concentration needed: doseMcg mcg per (units/100) ml = doseMcg * 100 / units mcg/ml
    // vialMg mg in X ml => vialMg * 1000 / X = concentration mcg/ml
    // vialMg * 1000 / X = doseMcg * 100 / units
    // X = vialMg * 1000 * units / (doseMcg * 100)
    // X = vialMg * units * 10 / doseMcg
    const bacWaterMl = (vialMg * units * 10) / doseMcg;
    const bacWaterUnits = bacWaterMl * 100;

    return {
      bacWaterMl: Math.round(bacWaterMl * 100) / 100,
      bacWaterUnits: Math.round(bacWaterUnits * 100) / 100,
    };
  }, [peptideVial, dosage, desiredUnits]);

  return (
    <div className="mx-auto w-full max-w-xl selection:bg-[#3b82f6]/30">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50">
        <div className="space-y-6 p-6">
          {/* Peptide Vial */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Beaker className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter Peptide Vial Contents (in mg)
              </span>
              <HelpTooltip content="Enter the total amount of peptide in the vial in milligrams (mg)." />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                Peptide Vial{" "}
                <span className="text-base font-normal text-slate-400">
                  (mg)
                </span>
              </span>
              <div className="w-3/5">
                <NumberInput
                  value={peptideVial}
                  stepMode="small"
                  min={0}
                  suffix="mg"
                  onChange={(val) => setPeptideVial(val)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Dosage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Syringe className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter Dosage (in micrograms, mcg)
              </span>
              <HelpTooltip content="Enter the desired dose per injection in micrograms (mcg)." />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                Dosage{" "}
                <span className="text-base font-normal text-slate-400">
                  (per dose)
                </span>
              </span>
              <div className="w-3/5">
                <NumberInput
                  value={dosage}
                  stepMode="large"
                  min={0}
                  suffix="mcg"
                  onChange={(val) => setDosage(val)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Desired Units */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <FlaskConical className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter Desired Units to Draw
              </span>
              <HelpTooltip content="Enter how many units you want to draw on the syringe for each dose. This determines how much BAC water to add." />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                Units
              </span>
              <div className="w-3/5">
                <NumberInput
                  value={desiredUnits}
                  stepMode="large"
                  min={0}
                  suffix="units"
                  onChange={(val) => setDesiredUnits(val)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="border-border/50 border-t pt-4">
            <div aria-live="polite" aria-atomic="true">
              {result ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#3b82f6]/20 bg-[#1d4ed8]/[0.03] p-6">
                    <h3 className="mb-4 text-lg font-bold text-[#1d4ed8]">
                      Required BAC Water For Peptide Reconstitution
                    </h3>
                    <div className="rounded-xl bg-gradient-to-r from-[#1e3a5f]/10 to-[#3b82f6]/10 p-5">
                      <p className="text-base font-bold text-slate-800 dark:text-white">
                        Reconstitute your peptide vial using{" "}
                        <span className="text-[#1d4ed8]">
                          {result.bacWaterMl.toFixed(2)} ml
                        </span>{" "}
                        of BAC water.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Where {result.bacWaterMl.toFixed(2)} ml ={" "}
                        {result.bacWaterUnits.toFixed(0)} units of BAC water.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50">
                    <Droplets className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter valid values to see results
                  </p>
                  <p className="text-muted-foreground/70 mt-1 text-xs">
                    Results will update in real time as you type
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
