import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import {
  HelpCircle,
  ShoppingCart,
  Calendar,
  Clock,
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

const FREQUENCY_OPTIONS = [
  { label: "Everyday (7 days per week)", daysPerWeek: 7 },
  { label: "6 days per week", daysPerWeek: 6 },
  { label: "5 days per week", daysPerWeek: 5 },
  { label: "4 days per week", daysPerWeek: 4 },
  { label: "3 days per week", daysPerWeek: 3 },
  { label: "2 days per week", daysPerWeek: 2 },
  { label: "1 day per week", daysPerWeek: 1 },
  { label: "Every other day (3.5/week)", daysPerWeek: 3.5 },
];

const DOSE_UNITS = ["mcg", "mg"] as const;

const STANDARD_VIAL_SIZES = [5, 10, 15, 20, 30]; // in mg

export function OrderCalculator() {
  const [frequency, setFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [doseAmount, setDoseAmount] = useState<number | string>(50);
  const [doseUnit, setDoseUnit] = useState<"mcg" | "mg">("mcg");
  const [timesPerDay, setTimesPerDay] = useState<number | string>(1);
  const [durationWeeks, setDurationWeeks] = useState<number | string>(4);
  const [useCustomVial, setUseCustomVial] = useState(false);
  const [customVialSize, setCustomVialSize] = useState<number | string>(5);

  const result = useMemo(() => {
    const dose = Number(doseAmount) || 0;
    const times = Number(timesPerDay) || 0;
    const weeks = Number(durationWeeks) || 0;

    if (dose <= 0 || times <= 0 || weeks <= 0) return null;

    const totalDoses = frequency.daysPerWeek * times * weeks;
    const totalMcg =
      doseUnit === "mcg" ? dose * totalDoses : dose * 1000 * totalDoses;
    const totalMg = totalMcg / 1000;

    // Calculate vials needed for each standard size
    const vialBreakdown = STANDARD_VIAL_SIZES.map((size) => ({
      size,
      count: Math.ceil(totalMg / size),
    }));

    // Custom vial
    const customSize = Number(customVialSize) || 5;
    const customVialCount = Math.ceil(totalMg / customSize);

    return {
      totalMcg: Math.round(totalMcg * 100) / 100,
      totalMg: Math.round(totalMg * 100) / 100,
      totalDoses: Math.round(totalDoses * 10) / 10,
      vialBreakdown,
      customVialCount,
      customVialSize: customSize,
      formulaStr: `${dose} ${doseUnit} × ${frequency.daysPerWeek} days/week × ${times} per day × ${weeks} weeks = ${totalMcg.toLocaleString()} mcg`,
    };
  }, [
    doseAmount,
    doseUnit,
    timesPerDay,
    durationWeeks,
    frequency,
    customVialSize,
  ]);

  return (
    <div className="selection:bg-primary/30 dark:selection:bg-primary/40 mx-auto w-full max-w-xl">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-5 p-6">
          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-foreground text-lg font-bold">
              Frequency
            </label>
            <select
              value={frequency.label}
              onChange={(e) => {
                const f = FREQUENCY_OPTIONS.find(
                  (o) => o.label === e.target.value,
                );
                if (f) setFrequency(f);
              }}
              className="border-border bg-muted text-foreground focus:border-primary h-12 w-full rounded-xl border px-4 text-base font-bold outline-none"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dose Amount */}
          <div className="space-y-2">
            <label className="text-foreground text-lg font-bold">
              Dose Amount
            </label>
            <div className="flex gap-2">
              <NumberInput
                value={doseAmount}
                stepMode="large"
                min={0}
                onChange={(val) => setDoseAmount(val)}
                className="flex-1"
              />
              <select
                value={doseUnit}
                onChange={(e) => setDoseUnit(e.target.value as "mcg" | "mg")}
                className="border-border bg-muted text-foreground focus:border-primary h-12 w-24 rounded-xl border px-3 text-center text-base font-bold outline-none"
              >
                {DOSE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Times Per Day & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-foreground text-lg font-bold">
                Times Per Day
              </label>
              <NumberInput
                value={timesPerDay}
                stepMode="small"
                min={1}
                onChange={(val) => setTimesPerDay(val)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-foreground text-lg font-bold">
                Duration{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  (weeks)
                </span>
              </label>
              <NumberInput
                value={durationWeeks}
                stepMode="small"
                min={1}
                onChange={(val) => setDurationWeeks(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Result */}
          <div className="border-border/50 border-t pt-4">
            {result ? (
              <div className="space-y-3">
                <div className="bg-muted space-y-2 rounded-xl p-4">
                  <p className="text-muted-foreground text-sm font-bold">
                    <Calendar className="mr-1 inline h-4 w-4" />
                    Dosing Schedule:{" "}
                    <span className="text-foreground">
                      {frequency.label}, {timesPerDay} time(s) per day
                    </span>
                  </p>
                  <p className="text-muted-foreground text-sm font-bold">
                    Total Amount Needed:{" "}
                    <strong className="text-primary">
                      {result.totalMcg.toLocaleString()} mcg
                    </strong>{" "}
                    <span className="text-muted-foreground/80">
                      ({result.totalMg} mg)
                    </span>
                  </p>

                  <div className="pt-2">
                    <p className="text-foreground2 mb-1 text-sm font-bold">
                      Vials Needed:
                    </p>
                    <ul className="ml-4 list-disc space-y-0.5">
                      {result.vialBreakdown.map((v) => (
                        <li
                          key={v.size}
                          className="text-muted-foreground text-sm"
                        >
                          {v.size}mg vials:{" "}
                          <strong className="text-foreground">{v.count}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Custom Vial Size */}
                  <div className="pt-2">
                    <label className="text-muted-foreground flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={useCustomVial}
                        onChange={(e) => setUseCustomVial(e.target.checked)}
                        className="accent-primary rounded"
                      />
                      <span className="font-bold">Custom Vial Size</span>
                    </label>
                    {useCustomVial && (
                      <div className="mt-2 flex items-center gap-2">
                        <NumberInput
                          value={customVialSize}
                          stepMode="small"
                          min={0.1}
                          suffix="mg"
                          onChange={(val) => setCustomVialSize(val)}
                          className="w-48"
                        />
                        <span className="text-muted-foreground text-sm font-bold">
                          →{" "}
                          <strong className="text-primary">
                            {result.customVialCount}
                          </strong>{" "}
                          vials
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="from-primary/10 to-secondary/10 rounded-xl bg-gradient-to-r px-4 py-3">
                  <p className="text-primary text-xs italic">
                    Calculation: {result.formulaStr}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-border from-muted to-muted/60 rounded-2xl border bg-gradient-to-br p-8 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <ShoppingCart className="text-muted-foreground h-8 w-8" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Enter valid values to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
