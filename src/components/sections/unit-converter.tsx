import { useState, useMemo } from "react";
import { HelpCircle, ArrowRightLeft } from "lucide-react";
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

const UNITS = ["ml", "mg", "uL", "mcg"] as const;
type Unit = (typeof UNITS)[number];

// Conversion factors to a common base (microgram-equivalent for mass, microliter for volume)
// For water/solutions: 1 ml = 1000 mg = 1000 uL = 1,000,000 mcg
function convertValue(value: number, from: Unit): { ml: number; mg: number; uL: number; mcg: number } {
  let baseMl: number;

  switch (from) {
    case "ml":
      baseMl = value;
      break;
    case "mg":
      baseMl = value / 1000;
      break;
    case "uL":
      baseMl = value / 1000;
      break;
    case "mcg":
      baseMl = value / 1_000_000;
      break;
  }

  return {
    ml: baseMl,
    mg: baseMl * 1000,
    uL: baseMl * 1000,
    mcg: baseMl * 1_000_000,
  };
}

function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Number.isInteger(n)) return n.toLocaleString();
  if (Math.abs(n) < 0.001) return n.toExponential(2);
  if (Math.abs(n) < 1) return n.toFixed(4);
  if (Math.abs(n) < 100) return n.toFixed(2);
  return Math.round(n).toLocaleString();
}

export function UnitConverter() {
  const [inputValue, setInputValue] = useState("5");
  const [inputUnit, setInputUnit] = useState<Unit>("ml");

  const results = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return null;
    return convertValue(num, inputUnit);
  }, [inputValue, inputUnit]);

  const handleClear = () => {
    setInputValue("");
  };

  const handleConvert = () => {
    // Already reactive — this button is a UX affordance
    const num = parseFloat(inputValue);
    if (isNaN(num)) setInputValue("0");
  };

  return (
    <div className="mx-auto w-full max-w-xl selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-6 p-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ArrowRightLeft className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter the value here to convert
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Value
              </span>
              <div className="flex w-3/5 gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) {
                        setInputValue(v);
                      }
                    }}
                    className="h-12 w-full rounded-l-xl border border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 text-center text-lg font-bold text-slate-800 dark:text-slate-200 outline-none selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40 focus:border-[#3b82f6] focus:bg-white dark:text-white"
                  />
                </div>
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as Unit)}
                  className="h-12 w-24 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#1d4ed8] dark:from-slate-200 to-[#3b82f6] dark:to-slate-400 px-3 text-center text-base font-bold text-white dark:text-slate-900 outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                className="h-10 rounded-xl bg-gradient-to-r from-[#1d4ed8] dark:from-slate-200 to-[#3b82f6] dark:to-slate-400 px-6 text-sm font-bold text-white dark:text-slate-900 transition-opacity hover:opacity-90"
              >
                CONVERT
              </button>
              <button
                onClick={handleClear}
                className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-6 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="border-border/50 border-t pt-4">
            {results ? (
              <div className="space-y-4">
                {/* Milligrams */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#1d4ed8]">
                    Milligrams(mg)
                  </span>
                  <div className="flex w-3/5 items-center">
                    <div className="flex-1 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 px-4 py-3 text-center text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                      {formatNumber(results.mg)}
                    </div>
                    <div className="rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                      mg
                    </div>
                  </div>
                </div>

                {/* Microlitres */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#1d4ed8]">
                    Microlitres(uL)
                  </span>
                  <div className="flex w-3/5 items-center">
                    <div className="flex-1 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 px-4 py-3 text-center text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                      {formatNumber(results.uL)}
                    </div>
                    <div className="rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                      uL
                    </div>
                  </div>
                </div>

                {/* Micrograms */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#1d4ed8]">
                    Micrograms(mcg)
                  </span>
                  <div className="flex w-3/5 items-center">
                    <div className="flex-1 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 px-4 py-3 text-center text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                      {formatNumber(results.mcg)}
                    </div>
                    <div className="rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                      mcg
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50">
                  <ArrowRightLeft className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Enter a value to convert
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
