import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { HelpCircle, ShoppingCart, Calendar, Clock, FlaskConical } from "lucide-react";
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
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-[#11696f]/10 hover:text-[#11696f] active:bg-[#11696f]/20"
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
          className="h-12 w-full border-y border-slate-200 bg-[#1e3a5f]/5 text-center text-lg font-bold text-slate-800 outline-none selection:bg-[#2bb3ba]/30 focus:border-[#2bb3ba] focus:bg-white dark:text-white"
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
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-[#11696f]/10 hover:text-[#11696f] active:bg-[#11696f]/20"
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
    const totalMcg = doseUnit === "mcg" ? dose * totalDoses : dose * 1000 * totalDoses;
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
  }, [doseAmount, doseUnit, timesPerDay, durationWeeks, frequency, customVialSize]);

  return (
    <div className="mx-auto w-full max-w-xl selection:bg-[#2bb3ba]/30">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50">
        <div className="space-y-5 p-6">
          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-lg font-bold text-slate-800 dark:text-white">
              Frequency
            </label>
            <select
              value={frequency.label}
              onChange={(e) => {
                const f = FREQUENCY_OPTIONS.find((o) => o.label === e.target.value);
                if (f) setFrequency(f);
              }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-[#1e3a5f]/5 px-4 text-base font-bold text-slate-800 outline-none focus:border-[#2bb3ba] dark:text-white"
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
            <label className="text-lg font-bold text-slate-800 dark:text-white">
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
                className="h-12 w-24 rounded-xl border border-slate-200 bg-[#1e3a5f]/5 px-3 text-center text-base font-bold text-slate-800 outline-none focus:border-[#2bb3ba] dark:text-white"
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
              <label className="text-lg font-bold text-slate-800 dark:text-white">
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
              <label className="text-lg font-bold text-slate-800 dark:text-white">
                Duration{" "}
                <span className="text-sm font-normal text-slate-400">(weeks)</span>
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
                <div className="rounded-xl bg-[#1e3a5f]/5 p-4 space-y-2">
                  <p className="text-sm font-bold text-slate-600">
                    <Calendar className="mr-1 inline h-4 w-4" />
                    Dosing Schedule:{" "}
                    <span className="text-slate-800 dark:text-white">
                      {frequency.label}, {timesPerDay} time(s) per day
                    </span>
                  </p>
                  <p className="text-sm font-bold text-slate-600">
                    Total Amount Needed:{" "}
                    <strong className="text-[#11696f]">
                      {result.totalMcg.toLocaleString()} mcg
                    </strong>{" "}
                    <span className="text-slate-400">
                      ({result.totalMg} mg)
                    </span>
                  </p>

                  <div className="pt-2">
                    <p className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                      Vials Needed:
                    </p>
                    <ul className="ml-4 list-disc space-y-0.5">
                      {result.vialBreakdown.map((v) => (
                        <li
                          key={v.size}
                          className="text-sm text-slate-600 dark:text-slate-400"
                        >
                          {v.size}mg vials:{" "}
                          <strong className="text-slate-800 dark:text-white">
                            {v.count}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Custom Vial Size */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={useCustomVial}
                        onChange={(e) => setUseCustomVial(e.target.checked)}
                        className="rounded accent-[#11696f]"
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
                        <span className="text-sm font-bold text-slate-600">
                          →{" "}
                          <strong className="text-[#11696f]">
                            {result.customVialCount}
                          </strong>{" "}
                          vials
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-[#1e3a5f]/10 to-[#2bb3ba]/10 px-4 py-3">
                  <p className="text-xs italic text-[#11696f]">
                    Calculation: {result.formulaStr}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50">
                  <ShoppingCart className="h-8 w-8 text-slate-400" />
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
