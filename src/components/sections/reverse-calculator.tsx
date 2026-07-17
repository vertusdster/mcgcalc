import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useTransition,
} from "react";
import {
  HelpCircle,
  Beaker,
  Droplets,
  Syringe,
  FlaskConical,
} from "lucide-react";
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
        className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl text-xl font-bold transition-colors"
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
          className="border-border bg-muted text-foreground selection:bg-primary/30 dark:selection:bg-primary/40 focus:border-primary focus:bg-background h-12 w-full border-y text-center text-lg font-bold outline-none"
        />
        {suffix && (
          <span className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl text-xl font-bold transition-colors"
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
    <div className="selection:bg-primary/30 dark:selection:bg-primary/40 mx-auto w-full max-w-xl">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-6 p-6">
          {/* Peptide Vial */}
          <div className="space-y-3">
            <div className="text-muted-foreground flex items-start gap-2">
              <Beaker className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter Peptide Vial Contents (in mg){" "}
                <HelpTooltip content="Enter the total amount of peptide in the vial in milligrams (mg)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xl font-bold">
                Peptide Vial{" "}
                <span className="text-muted-foreground text-base font-normal">
                  (mg)
                </span>
              </span>
              <div className="min-w-0 flex-1 sm:max-w-[60%]">
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
            <div className="text-muted-foreground flex items-start gap-2">
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter Dosage (in micrograms, mcg){" "}
                <HelpTooltip content="Enter the desired dose per injection in micrograms (mcg)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xl font-bold">
                Dosage{" "}
                <span className="text-muted-foreground text-base font-normal">
                  (per dose)
                </span>
              </span>
              <div className="min-w-0 flex-1 sm:max-w-[60%]">
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
            <div className="text-muted-foreground flex items-start gap-2">
              <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter Desired Units to Draw{" "}
                <HelpTooltip content="Enter how many units you want to draw on the syringe for each dose. This determines how much BAC water to add." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xl font-bold">Units</span>
              <div className="min-w-0 flex-1 sm:max-w-[60%]">
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
                  <div className="border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] rounded-2xl border p-6">
                    <h3 className="text-primary mb-4 text-lg font-bold">
                      Required BAC Water For Peptide Reconstitution
                    </h3>
                    <div className="from-primary/10 to-secondary/10 rounded-xl bg-gradient-to-r p-5">
                      <p className="text-foreground text-base font-bold">
                        Reconstitute your peptide vial using{" "}
                        <span className="text-primary">
                          {result.bacWaterMl.toFixed(2)} ml
                        </span>{" "}
                        of BAC water.
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Where {result.bacWaterMl.toFixed(2)} ml ={" "}
                        {result.bacWaterUnits.toFixed(0)} units of BAC water.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border from-muted to-muted/60 rounded-2xl border bg-gradient-to-br p-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Droplets className="text-muted-foreground h-8 w-8" />
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
