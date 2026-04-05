import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useTransition,
  useDeferredValue,
} from "react";
import {
  Plus,
  Trash2,
  HelpCircle,
  Beaker,
  Droplets,
  Syringe,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Peptide {
  id: string;
  quantity: number | string;
  dose: number | string;
  doseUnit: "mcg" | "mg";
}

interface CalculationResult {
  id: string;
  volumeMl: number;
  units: number;
  isValid: boolean;
  fillPercentage: number;
}

interface SavedCalculation {
  id: string;
  label: string;
  savedAt: string;
  syringeValue: number;
  waterVolume: number | string;
  waterUnit: "ml" | "IU";
  peptides: Peptide[];
}

const STORAGE_KEY = "peptide-saved-calculations";

function AnimatedSyringe({
  fillPercentage,
  units,
  isValid,
  maxUnits,
}: {
  fillPercentage: number;
  units: number;
  isValid: boolean;
  maxUnits: number;
}) {
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100);

  const majorMarks =
    maxUnits === 100
      ? [0, 20, 40, 60, 80, 100]
      : maxUnits === 50
        ? [0, 10, 20, 30, 40, 50]
        : [0, 10, 20, 30];

  return (
    <div
      className="relative w-full py-2"
      role="img"
      aria-label={`Syringe fill: ${Math.round(clampedFill)}% — ${isValid ? "valid dose" : "exceeds capacity"}`}
    >
      <div className="px-2">
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative h-12 overflow-hidden rounded-none border border-slate-300 bg-slate-100">
            <div
              className={cn(
                "absolute bottom-0 left-0 top-0 z-10 transition-all duration-200 ease-out",
                clampedFill > 0 ? "rounded-none" : "",
                isValid
                  ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba]"
                  : "bg-slate-300",
              )}
              style={{
                width: `${clampedFill}%`,
                ...(!isValid
                  ? {
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 10px, #fde68a 10px, #fde68a 20px)",
                    }
                  : {}),
              }}
            />

            <div className="pointer-events-none absolute inset-y-0 left-1 right-1 z-30">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <span
                    key={mark}
                    className={cn(
                      "absolute top-1/2 text-[10px] font-bold tabular-nums transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "text-white"
                          : "text-amber-800"
                        : "text-slate-500",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {mark}
                  </span>
                );
              })}
            </div>

            <div className="absolute left-1 right-1 top-0 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute top-0 w-0.5 transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-800"
                        : "bg-slate-400",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: "14px",
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            <div className="absolute left-1 right-1 top-0 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-0 transition-colors duration-300",
                      i % 5 === 0 ? "h-3.5 w-0.5" : "h-2 w-px",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-700"
                        : "bg-slate-300",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            <div className="absolute bottom-0 left-1 right-1 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute bottom-0 w-0.5 transition-colors duration-300",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-800"
                        : "bg-slate-400",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: "14px",
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>

            <div className="absolute bottom-0 left-1 right-1 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100;
                const isInLiquid = markPosition <= clampedFill;
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute bottom-0 transition-colors duration-300",
                      i % 5 === 0 ? "h-3.5 w-0.5" : "h-2 w-px",
                      isInLiquid
                        ? isValid
                          ? "bg-white"
                          : "bg-amber-700"
                        : "bg-slate-300",
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SYRINGE_VOLUMES = [
  { value: 30, label: "30 units", ml: 0.3 },
  { value: 50, label: "50 units", ml: 0.5 },
  { value: 100, label: "100 units", ml: 1.0 },
];

const WATER_UNITS = ["ml", "IU"] as const;

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

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Smart step: adjusts increment size based on current value magnitude
function smartStep(current: number, mode: "small" | "large" = "small"): number {
  const v = Math.abs(current);
  if (mode === "large") {
    // For dose fields (mcg scale: 0–10000)
    if (v < 10) return 1;
    if (v < 100) return 10;
    if (v < 1000) return 50;
    return 100;
  }
  // For quantity/water fields (mg/mL scale: 0–100)
  if (v < 1) return 0.1;
  if (v < 10) return 0.5;
  return 1;
}

// Number input with large +/− stepper buttons
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

  // Sync when parent sets value externally (load saved calc)
  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  const clamp = (n: number) => Math.max(min, parseFloat(n.toFixed(10)));
  const format = (n: number) => parseFloat(n.toFixed(4)).toString();

  const step = (dir: 1 | -1) => {
    setDisplay((prev) => {
      const cur = Number(prev) || 0;
      const next = format(clamp(cur + dir * smartStep(cur, stepMode)));
      // Commit to parent as low-priority — display updates first
      startTransition(() => onChangeRef.current(next));
      return next;
    });
  };

  return (
    <div className={cn("flex items-center", className)}>
      {/* Decrement */}
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => step(-1)}
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-[#11696f]/10 hover:text-[#11696f] active:bg-[#11696f]/20"
      >
        −
      </button>

      {/* Text input */}
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

      {/* Increment */}
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

export function PeptideCalculator() {
  const [syringeVolume, setSyringeVolume] = useState(SYRINGE_VOLUMES[0]);
  const [peptides, setPeptides] = useState<Peptide[]>([
    { id: generateId(), quantity: 5, dose: 250, doseUnit: "mcg" },
  ]);
  const [waterVolume, setWaterVolume] = useState<number | string>(5);
  const [waterUnit, setWaterUnit] = useState<"ml" | "IU">("ml");

  // Save/load state
  const [savedCalculations, setSavedCalculations] = useState<
    SavedCalculation[]
  >([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedCalculations(JSON.parse(raw));
    } catch {}
  }, []);

  const persistSaved = useCallback((list: SavedCalculation[]) => {
    setSavedCalculations(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const handleSave = useCallback(() => {
    const label =
      saveLabel.trim() || `Calculation ${new Date().toLocaleString()}`;
    const entry: SavedCalculation = {
      id: generateId(),
      label,
      savedAt: new Date().toISOString(),
      syringeValue: syringeVolume.value,
      waterVolume,
      waterUnit,
      peptides,
    };
    persistSaved([entry, ...savedCalculations]);
    setSaveLabel("");
    setShowSaveInput(false);
    setShowSaved(true);
  }, [
    saveLabel,
    syringeVolume,
    waterVolume,
    waterUnit,
    peptides,
    savedCalculations,
    persistSaved,
  ]);

  const handleLoad = useCallback((saved: SavedCalculation) => {
    const vol =
      SYRINGE_VOLUMES.find((v) => v.value === saved.syringeValue) ??
      SYRINGE_VOLUMES[0];
    setSyringeVolume(vol);
    setWaterVolume(saved.waterVolume);
    setWaterUnit(saved.waterUnit);
    setPeptides(saved.peptides.map((p) => ({ ...p, id: generateId() })));
    setShowSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      persistSaved(savedCalculations.filter((s) => s.id !== id));
    },
    [savedCalculations, persistSaved],
  );

  const addPeptide = useCallback(() => {
    if (peptides.length < 5) {
      setPeptides((prev) => [
        ...prev,
        { id: generateId(), quantity: 10, dose: 500, doseUnit: "mcg" },
      ]);
    }
  }, [peptides.length]);

  const removePeptide = useCallback((id: string) => {
    setPeptides((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePeptide = useCallback(
    (id: string, field: keyof Peptide, value: number | string) => {
      setPeptides((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const results = useMemo((): CalculationResult[] | null => {
    const waterVolNum = Number(waterVolume) || 0;
    const waterMl = waterUnit === "IU" ? waterVolNum / 100 : waterVolNum;

    const hasValidPeptide = peptides.some(
      (p) => (Number(p.quantity) || 0) > 0 && (Number(p.dose) || 0) > 0,
    );
    if (!hasValidPeptide || waterMl <= 0) {
      return null;
    }

    return peptides.map((peptide) => {
      const doseNum = Number(peptide.dose) || 0;
      const quantNum = Number(peptide.quantity) || 0;

      const doseMg = peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum;
      const concentrationMgPerMl = quantNum / waterMl;
      const volumeNeededMl =
        concentrationMgPerMl > 0 ? doseMg / concentrationMgPerMl : 0;
      const units = (volumeNeededMl / syringeVolume.ml) * syringeVolume.value;
      const fillPercentage = (units / syringeVolume.value) * 100;

      return {
        id: peptide.id,
        volumeMl: volumeNeededMl,
        units: Math.round(units * 10) / 10,
        isValid: units > 0 && units <= syringeVolume.value,
        fillPercentage,
      };
    });
  }, [peptides, waterVolume, waterUnit, syringeVolume]);

  const totalUnits = useMemo(() => {
    if (!results) return 0;
    return results.reduce((sum, r) => sum + r.units, 0);
  }, [results]);

  const totalFillPercentage = useMemo(() => {
    return (totalUnits / syringeVolume.value) * 100;
  }, [totalUnits, syringeVolume.value]);

  const isTotalValid = totalUnits > 0 && totalUnits <= syringeVolume.value;

  // Remove debounce — syringe updates in real time
  const debouncedFill = totalFillPercentage;
  const debouncedValid = isTotalValid;

  return (
    <div className="mx-auto w-full max-w-xl selection:bg-[#2bb3ba]/30">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50">
        <div className="space-y-6 p-6">
          {/* Syringe Volume */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Syringe className="h-5 w-5" />
              <span className="text-sm font-bold">
                Select the Total Syringe Volume
              </span>
              <HelpTooltip content="Select the total volume of the syringe you are using. Common sizes are 0.3mL (30 units), 0.5mL (50 units), and 1mL (100 units)." />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800">Volume</Label>
              <div
                className="flex w-3/5 gap-2"
                role="group"
                aria-label="Syringe volume"
              >
                {SYRINGE_VOLUMES.map((vol) => (
                  <button
                    key={vol.value}
                    onClick={() => setSyringeVolume(vol)}
                    aria-pressed={syringeVolume.value === vol.value}
                    className={cn(
                      "h-12 flex-1 rounded-xl px-4 text-sm font-bold transition-all duration-200",
                      syringeVolume.value === vol.value
                        ? "border-transparent bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-md"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                  >
                    {vol.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Peptide Quantities */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Beaker className="h-5 w-5" />
                <span className="text-sm font-bold">
                  Enter the Quantity of Peptide
                </span>
                <HelpTooltip content="Enter total milligrams (mg) per vial. You can add up to 5 peptides." />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addPeptide}
                disabled={peptides.length >= 5}
                className="h-8 gap-1.5 text-xs font-bold shadow-sm transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-[#11696f] hover:to-[#2bb3ba] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                ADD PEPTIDE
              </Button>
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="animate-in fade-in flex items-center justify-between duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-800">
                      Peptide {index + 1}
                    </span>
                    {peptides.length > 1 && (
                      <button
                        onClick={() => removePeptide(peptide.id)}
                        className="rounded-full bg-slate-100 p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="flex w-3/5 items-center">
                    <NumberInput
                      value={peptide.quantity}
                      stepMode="small"
                      min={0}
                      suffix="mg"
                      onChange={(val) =>
                        updatePeptide(peptide.id, "quantity", val)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Volume */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Droplets className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter the Quantity of Bacteriostatic Water
              </span>
              <HelpTooltip content="Enter the volume of Bacteriostatic Water added. Use ml for direct volume, or IU if measuring with a U-100 insulin syringe (100 IU = 1 mL)." />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800">Water</Label>
              <div className="flex w-3/5 gap-2">
                <NumberInput
                  value={waterVolume}
                  stepMode="small"
                  min={0}
                  onChange={(val) => setWaterVolume(val)}
                  className="flex-1"
                />
                <div
                  className="flex shrink-0"
                  role="group"
                  aria-label="Water volume unit"
                >
                  {WATER_UNITS.map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setWaterUnit(unit)}
                      aria-pressed={waterUnit === unit}
                      className={cn(
                        "h-12 px-4 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl",
                        waterUnit === unit
                          ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Peptide Doses */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Syringe className="h-5 w-5" />
              <span className="text-sm font-bold">
                Enter the Quantity of Peptide in each dose
              </span>
              <HelpTooltip content="Enter the required dose for each peptide. Choose mcg or mg as unit." />
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="animate-in fade-in flex items-center justify-between duration-300"
                >
                  <Label className="text-xl font-bold text-slate-800">
                    Peptide {index + 1}
                  </Label>
                  <div className="flex w-3/5 gap-2">
                    <NumberInput
                      value={peptide.dose}
                      stepMode="large"
                      min={0}
                      onChange={(val) => updatePeptide(peptide.id, "dose", val)}
                      className="flex-1"
                    />
                    <div
                      className="flex shrink-0"
                      role="group"
                      aria-label="Dose unit"
                    >
                      {(["mcg", "mg"] as const).map((unit) => (
                        <button
                          key={unit}
                          onClick={() =>
                            updatePeptide(peptide.id, "doseUnit", unit)
                          }
                          aria-pressed={peptide.doseUnit === unit}
                          className={cn(
                            "h-12 px-4 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl",
                            peptide.doseUnit === unit
                              ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-sm"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                          )}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="border-border/50 border-t pt-4">
            <div aria-live="polite" aria-atomic="true">
              {results ? (
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-2xl p-6 transition-all duration-500",
                      isTotalValid
                        ? "border border-[#2bb3ba]/20 bg-[#11696f]/[0.03]"
                        : "border border-slate-200 bg-slate-50",
                    )}
                  >
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-lg font-bold tracking-tight text-slate-800">
                        {peptides.length > 1 ? "Total Volume" : "Formulate"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-2xl font-black tabular-nums",
                            isTotalValid ? "text-[#11696f]" : "text-slate-500",
                          )}
                        >
                          {totalUnits.toFixed(1)}
                        </span>
                        <span className="text-base font-bold text-slate-700">
                          units
                        </span>
                      </div>
                    </div>

                    <AnimatedSyringe
                      fillPercentage={debouncedFill}
                      units={totalUnits}
                      isValid={debouncedValid}
                      maxUnits={syringeVolume.value}
                    />

                    <div className="mt-2 border-t border-slate-200/60 pt-3">
                      <ul className="space-y-3">
                        {results.map((result, index) => (
                          <li
                            key={result.id}
                            className="flex items-start gap-3 text-sm leading-relaxed"
                          >
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#11696f]" />
                            <span className="text-slate-700">
                              Draw <strong>{result.units} units</strong> for{" "}
                              <strong>
                                {peptides[index].dose}
                                {peptides[index].doseUnit}
                              </strong>{" "}
                              doses
                              {peptides.length > 1
                                ? ` of Peptide ${index + 1}`
                                : ""}
                            </span>
                          </li>
                        ))}
                        {peptides.map((peptide, index) => {
                          const doseNum = Number(peptide.dose) || 0;
                          const quantNum = Number(peptide.quantity) || 0;
                          const waterVolNum = Number(waterVolume) || 0;

                          const doseMg =
                            peptide.doseUnit === "mcg"
                              ? doseNum / 1000
                              : doseNum;
                          const waterMl =
                            waterUnit === "IU"
                              ? waterVolNum / 100
                              : waterVolNum;
                          const concentrationMgPerMl =
                            waterMl > 0 ? quantNum / waterMl : 0;
                          const totalDosesNum =
                            doseMg > 0 ? quantNum / doseMg : 0;

                          const formatDoses = (num: number) =>
                            Number.isInteger(num)
                              ? num.toString()
                              : num.toFixed(2);

                          return (
                            <li
                              key={`conc-${peptide.id}`}
                              className="animate-in fade-in flex items-start gap-3 text-sm leading-relaxed duration-500"
                            >
                              <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400/80" />
                              <span className="font-bold text-slate-600">
                                With a concentration of{" "}
                                <strong>
                                  {concentrationMgPerMl.toFixed(2)}mg/mL
                                </strong>
                                ,{" "}
                                {peptides.length > 1
                                  ? `Peptide ${index + 1} `
                                  : ""}
                                vial contains ~
                                <strong>
                                  {formatDoses(totalDosesNum)} doses
                                </strong>{" "}
                                in {waterMl}mL.
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  {!isTotalValid && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200">
                        <span className="text-xs font-bold text-slate-600">
                          !
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Total injection volume exceeds syringe capacity, please
                        adjust doses or use a larger syringe.
                      </p>
                    </div>
                  )}

                  {/* Save button */}
                  {isTotalValid && (
                    <div className="pt-1">
                      {showSaveInput ? (
                        <div className="animate-in fade-in flex gap-2 duration-200">
                          <Input
                            type="text"
                            placeholder="Label (e.g. BPC-157 Morning)"
                            value={saveLabel}
                            onChange={(e) => setSaveLabel(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            className="h-9 rounded-xl border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#2bb3ba]"
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            className="h-9 shrink-0 rounded-xl bg-gradient-to-r from-[#11696f] to-[#2bb3ba] px-4 text-xs font-bold text-white transition-opacity hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowSaveInput(false);
                              setSaveLabel("");
                            }}
                            className="h-9 shrink-0 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-500 hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSaveInput(true)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-[#2bb3ba] hover:text-[#11696f]"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                          Save this calculation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50">
                    <Syringe className="h-8 w-8 text-slate-400" />
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

      {/* Saved Calculations Panel */}
      {savedCalculations.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-[#11696f]" />
              Saved Calculations
              <span className="rounded-full bg-[#11696f]/10 px-2 py-0.5 text-xs font-bold text-[#11696f]">
                {savedCalculations.length}
              </span>
            </span>
            {showSaved ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showSaved && (
            <div className="animate-in fade-in mt-2 space-y-2 duration-200">
              {savedCalculations.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {saved.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(saved.savedAt).toLocaleDateString()} ·{" "}
                      {saved.peptides.length} peptide
                      {saved.peptides.length > 1 ? "s" : ""} ·{" "}
                      {saved.syringeValue}U syringe
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 gap-2">
                    <button
                      onClick={() => handleLoad(saved)}
                      className="rounded-lg bg-gradient-to-r from-[#11696f] to-[#2bb3ba] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
