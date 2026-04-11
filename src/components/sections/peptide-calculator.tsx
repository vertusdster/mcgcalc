import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
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
import { AnimatedSyringe } from "@/components/elements/animated-syringe";
import type { Peptide, SavedCalculation, CalculationResult } from "@/lib/saved-calculations";
import {
  STORAGE_KEY,
  LOAD_KEY,
  SYRINGE_VOLUMES,
  loadSavedCalculations,
  persistSavedCalculations,
} from "@/lib/saved-calculations";

const WATER_UNITS = ["ml", "IU"] as const;

function HelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex align-middle items-center justify-center rounded-full transition-colors"
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
      onChangeRef.current(next);
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
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl bg-slate-100 dark:bg-slate-800/80 text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] dark:hover:bg-[#60a5fa]/10 dark:hover:text-[#60a5fa] active:bg-[#1d4ed8]/20 dark:active:bg-[#60a5fa]/20"
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
              onChangeRef.current(v);
            }
          }}
          onBlur={(e) => {
            const n = parseFloat(e.target.value);
            const val = String(isNaN(n) ? min : clamp(n));
            setDisplay(val);
            onChangeRef.current(val);
          }}
          className="h-12 w-full border-y border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 text-center text-lg font-bold text-slate-800 dark:text-slate-200 outline-none selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40 focus:border-[#3b82f6] focus:bg-white dark:text-white"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      {/* Increment */}
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl bg-slate-100 dark:bg-slate-800/80 text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] dark:hover:bg-[#60a5fa]/10 dark:hover:text-[#60a5fa] active:bg-[#1d4ed8]/20 dark:active:bg-[#60a5fa]/20"
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
    const saved = loadSavedCalculations();
    setSavedCalculations(saved);

    // Check if redirected from /saved with a load request
    try {
      const loadId = localStorage.getItem(LOAD_KEY);
      if (loadId) {
        localStorage.removeItem(LOAD_KEY);
        const target = saved.find((s) => s.id === loadId);
        if (target) {
          const vol = SYRINGE_VOLUMES.find((v) => v.value === target.syringeValue) ?? SYRINGE_VOLUMES[0];
          setSyringeVolume(vol);
          setWaterVolume(target.waterVolume);
          setWaterUnit(target.waterUnit);
          setPeptides(target.peptides.map((p) => ({ ...p, id: generateId() })));
        }
      }
    } catch {}
  }, []);

  const persistSaved = useCallback((list: SavedCalculation[]) => {
    setSavedCalculations(list);
    persistSavedCalculations(list);
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
    <div className="mx-auto w-full max-w-xl selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-6 p-6">
          {/* Syringe Volume */}
          <div className="mb-6 space-y-4">
            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Select the Total Syringe Volume{" "}
                <HelpTooltip content="Select the total volume of the syringe you are using. Common sizes are 0.3mL (30 units), 0.5mL (50 units), and 1mL (100 units)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800 dark:text-slate-200">Volume</Label>
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
                        ? "border-transparent bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white text-white dark:text-slate-900 shadow-md"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
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
              <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                <Beaker className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">
                  Enter the Quantity of Peptide{" "}
                  <HelpTooltip content="Enter total milligrams (mg) per vial. You can add up to 5 peptides." />
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addPeptide}
                disabled={peptides.length >= 5}
                className="h-8 shrink-0 gap-1 text-xs font-bold shadow-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-transparent dark:text-white dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Peptide
              </Button>
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="animate-in fade-in flex items-center justify-between duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      Peptide {index + 1}
                    </span>
                    {peptides.length > 1 && (
                      <button
                        onClick={() => removePeptide(peptide.id)}
                        className="rounded-full bg-slate-100 dark:bg-slate-800/80 p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 dark:hover:text-red-400"
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
            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
              <Droplets className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter the Quantity of Bacteriostatic Water{" "}
                <HelpTooltip content="Enter the volume of Bacteriostatic Water added. Use ml for direct volume, or IU if measuring with a U-100 insulin syringe (100 IU = 1 mL)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800 dark:text-slate-200">Water</Label>
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
                          ? "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
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
            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter the Quantity of Peptide in each dose{" "}
                <HelpTooltip content="Enter the required dose for each peptide. Choose mcg or mg as unit." />
              </span>
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="animate-in fade-in flex items-center justify-between duration-300"
                >
                  <Label className="text-xl font-bold text-slate-800 dark:text-slate-200">
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
                              ? "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white text-white dark:text-slate-900 shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
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
                        ? "border border-[#3b82f6]/20 dark:border-[#60a5fa]/20 bg-[#1d4ed8]/[0.03] dark:bg-[#60a5fa]/[0.06]"
                        : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50",
                    )}
                  >
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        {peptides.length > 1 ? "Total Volume" : "Formulate"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-xl font-black tabular-nums",
                            isTotalValid ? "text-[#1d4ed8] dark:text-white" : "text-slate-500 dark:text-slate-400",
                          )}
                        >
                          {totalUnits.toFixed(1)}
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
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

                    <div className="mt-2 border-t border-slate-200 dark:border-slate-800/60 pt-3">
                      <ul className="space-y-3">
                        {results.map((result, index) => (
                          <li
                            key={result.id}
                            className="flex items-start gap-3 text-sm leading-relaxed"
                          >
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1d4ed8]" />
                            <span className="text-slate-700 dark:text-slate-300">
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
                              <span className="font-bold text-slate-600 dark:text-slate-400">
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
                    <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          !
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
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
                            className="h-9 rounded-xl border-slate-200 dark:border-slate-800 text-sm focus-visible:ring-1 focus-visible:ring-[#3b82f6]"
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            className="h-9 shrink-0 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white px-4 text-xs font-bold text-white dark:text-slate-900 transition-opacity hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowSaveInput(false);
                              setSaveLabel("");
                            }}
                            className="h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSaveInput(true)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:border-[#3b82f6] hover:text-[#1d4ed8] dark:hover:border-[#60a5fa] dark:hover:text-[#60a5fa]"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                          Save this calculation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50">
                    <Syringe className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter valid values to see results
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
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
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-[#1d4ed8] dark:text-[#60a5fa]" />
              Saved Calculations
              <span className="rounded-full bg-[#1d4ed8]/10 dark:bg-[#60a5fa]/15 px-2 py-0.5 text-xs font-bold text-[#1d4ed8] dark:text-[#60a5fa]">
                {savedCalculations.length}
              </span>
            </span>
            {showSaved ? (
              <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            )}
          </button>

          {showSaved && (
            <div className="animate-in fade-in mt-2 space-y-2 duration-200">
              {savedCalculations.map((saved) => (
                <div
                  key={saved.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {saved.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(saved.savedAt).toLocaleDateString()} ·{" "}
                      {saved.peptides.length} peptide
                      {saved.peptides.length > 1 ? "s" : ""} ·{" "}
                      {saved.syringeValue}U syringe
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 gap-2">
                    <button
                      onClick={() => handleLoad(saved)}
                      className="rounded-lg bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white px-3 py-1.5 text-xs font-bold text-white dark:text-slate-900 transition-opacity hover:opacity-90"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 dark:hover:text-red-400"
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
