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
function convertValue(
  value: number,
  from: Unit,
): { ml: number; mg: number; uL: number; mcg: number } {
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
    <div className="selection:bg-primary/30 dark:selection:bg-primary/40 mx-auto w-full max-w-xl">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-6 p-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter the value here to convert
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground text-xl font-bold">Value</span>
              <div className="flex min-w-0 flex-1 gap-2 sm:max-w-[60%]">
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
                    className="border-border bg-muted text-foreground selection:bg-primary/30 dark:selection:bg-primary/40 focus:border-primary focus:bg-background h-12 w-full rounded-l-xl border text-center text-lg font-bold outline-none"
                  />
                </div>
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as Unit)}
                  className="border-border btn-primary-gradient h-12 w-24 rounded-r-xl border px-3 text-center text-base font-bold outline-none"
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
                className="btn-primary-gradient h-10 rounded-xl px-6 text-sm font-bold"
              >
                Convert
              </button>
              <button
                onClick={handleClear}
                className="bg-muted text-muted-foreground hover:bg-border h-10 rounded-xl px-6 text-sm font-bold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="border-border/50 border-t pt-4">
            {results ? (
              <div className="space-y-4">
                {/* Milligrams */}
                <div className="flex items-center justify-between">
                  <span className="text-primary text-lg font-bold">
                    Milligrams(mg)
                  </span>
                  <div className="flex min-w-0 flex-1 items-center sm:max-w-[60%]">
                    <div className="border-border bg-muted text-foreground flex-1 rounded-l-xl border border-r-0 px-4 py-3 text-center text-lg font-bold">
                      {formatNumber(results.mg)}
                    </div>
                    <div className="border-border bg-muted text-muted-foreground rounded-r-xl border px-4 py-3 text-sm font-bold">
                      mg
                    </div>
                  </div>
                </div>

                {/* Microlitres */}
                <div className="flex items-center justify-between">
                  <span className="text-primary text-lg font-bold">
                    Microlitres(uL)
                  </span>
                  <div className="flex min-w-0 flex-1 items-center sm:max-w-[60%]">
                    <div className="border-border bg-muted text-foreground flex-1 rounded-l-xl border border-r-0 px-4 py-3 text-center text-lg font-bold">
                      {formatNumber(results.uL)}
                    </div>
                    <div className="border-border bg-muted text-muted-foreground rounded-r-xl border px-4 py-3 text-sm font-bold">
                      uL
                    </div>
                  </div>
                </div>

                {/* Micrograms */}
                <div className="flex items-center justify-between">
                  <span className="text-primary text-lg font-bold">
                    Micrograms(mcg)
                  </span>
                  <div className="flex min-w-0 flex-1 items-center sm:max-w-[60%]">
                    <div className="border-border bg-muted text-foreground flex-1 rounded-l-xl border border-r-0 px-4 py-3 text-center text-lg font-bold">
                      {formatNumber(results.mcg)}
                    </div>
                    <div className="border-border bg-muted text-muted-foreground rounded-r-xl border px-4 py-3 text-sm font-bold">
                      mcg
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-border from-muted to-muted/60 rounded-2xl border bg-gradient-to-br p-8 text-center">
                <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <ArrowRightLeft className="text-muted-foreground h-8 w-8" />
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
