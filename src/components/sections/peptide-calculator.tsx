import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import type {
  Peptide,
  SavedCalculation,
  CalculationResult,
} from "@/lib/saved-calculations";
import {
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
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-full align-middle transition-colors"
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
        className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl text-xl font-bold transition-colors max-sm:h-10 max-sm:w-10 max-sm:text-lg"
      >
        −
      </button>

      {/* Text input */}
      <div className="relative min-w-0 flex-1">
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
          className="border-border bg-muted text-foreground selection:bg-primary/30 dark:selection:bg-primary/40 focus:border-primary focus:bg-background h-12 w-full border-y text-center text-lg font-bold outline-none max-sm:h-10 max-sm:text-base"
        />
        {suffix && (
          <span className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold">
            {suffix}
          </span>
        )}
      </div>

      {/* Increment */}
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl text-xl font-bold transition-colors max-sm:h-10 max-sm:w-10 max-sm:text-lg"
      >
        +
      </button>
    </div>
  );
}

interface PeptideCalculatorProps {
  defaultDose?: number;
  defaultVialSize?: number;
}

export function PeptideCalculator({
  defaultDose,
  defaultVialSize,
}: PeptideCalculatorProps = {}) {
  const [syringeVolume, setSyringeVolume] = useState(SYRINGE_VOLUMES[0]);
  const [peptides, setPeptides] = useState<Peptide[]>([
    {
      id: generateId(),
      quantity: defaultVialSize ?? 5,
      dose: defaultDose ?? 250,
      doseUnit: "mcg",
    },
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
          const vol =
            SYRINGE_VOLUMES.find((v) => v.value === target.syringeValue) ??
            SYRINGE_VOLUMES[0];
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
    <div className="selection:bg-primary/30 dark:selection:bg-primary/40 mx-auto w-full max-w-xl">
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-6 p-6">
          {/* Syringe Volume */}
          <div className="mb-6 space-y-4">
            <div className="text-muted-foreground hidden items-start gap-2 sm:flex">
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Select the Total Syringe Volume{" "}
                <HelpTooltip content="Select the total volume of the syringe you are using. Common sizes are 0.3mL (30 units), 0.5mL (50 units), and 1mL (100 units)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-foreground text-xl font-bold">
                  Volume
                </Label>
                <span className="inline shrink-0 sm:hidden">
                  <HelpTooltip content="Select the total volume of the syringe you are using. Common sizes are 0.3mL (30 units), 0.5mL (50 units), and 1mL (100 units)." />
                </span>
              </div>
              <div
                className="flex min-w-0 flex-1 gap-2 sm:max-w-[60%]"
                role="group"
                aria-label="Syringe volume"
              >
                {SYRINGE_VOLUMES.map((vol) => (
                  <button
                    key={vol.value}
                    onClick={() => setSyringeVolume(vol)}
                    aria-pressed={syringeVolume.value === vol.value}
                    className={cn(
                      "h-12 flex-1 rounded-xl px-4 text-sm font-bold transition-all duration-200 max-sm:h-10 max-sm:px-2 max-sm:text-xs",
                      syringeVolume.value === vol.value
                        ? "btn-primary-gradient border-transparent shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-border",
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
            <div className="text-muted-foreground hidden items-start gap-1.5 sm:flex">
              <Beaker className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter the Quantity of Peptide{" "}
                <HelpTooltip content="Enter total milligrams (mg) per vial. You can add up to 5 peptides." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={addPeptide}
                disabled={peptides.length >= 5}
                className="h-8 shrink-0 gap-1 text-xs font-bold shadow-sm transition-all duration-300"
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
                  <div className="flex items-center gap-3 max-sm:gap-1.5">
                    <span className="text-foreground text-xl font-bold max-sm:text-sm">
                      Peptide {index + 1}
                    </span>
                    {index === 0 && (
                      <span className="inline shrink-0 sm:hidden">
                        <HelpTooltip content="Enter total milligrams (mg) per vial. You can add up to 5 peptides." />
                      </span>
                    )}
                    {peptides.length > 1 && (
                      <button
                        onClick={() => removePeptide(peptide.id)}
                        className="bg-muted text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive rounded-full p-2 transition-colors max-sm:p-1.5"
                      >
                        <Trash2 className="h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 sm:max-w-[60%]">
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
            <div className="text-muted-foreground hidden items-start gap-2 sm:flex">
              <Droplets className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">
                Enter the Quantity of Bacteriostatic Water{" "}
                <HelpTooltip content="Enter the volume of Bacteriostatic Water added. Use ml for direct volume, or IU if measuring with a U-100 insulin syringe (100 IU = 1 mL)." />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-foreground text-xl font-bold">
                  Water
                </Label>
                <span className="inline shrink-0 sm:hidden">
                  <HelpTooltip content="Enter the volume of Bacteriostatic Water added. Use ml for direct volume, or IU if measuring with a U-100 insulin syringe (100 IU = 1 mL)." />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 gap-2 sm:max-w-[60%]">
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
                        "h-12 px-3 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl max-sm:h-10 max-sm:px-2 max-sm:text-xs",
                        waterUnit === unit
                          ? "btn-primary-gradient shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-border",
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
            <div className="text-muted-foreground hidden items-start gap-2 sm:flex">
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
                  <div className="flex items-center gap-1">
                    <Label className="text-foreground text-xl font-bold max-sm:text-sm">
                      Peptide {index + 1}
                    </Label>
                    {index === 0 && (
                      <span className="inline shrink-0 sm:hidden">
                        <HelpTooltip content="Enter the required dose for each peptide. Choose mcg or mg as unit." />
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 gap-2 sm:max-w-[60%]">
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
                            "h-12 px-3 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl max-sm:h-10 max-sm:px-2 max-sm:text-xs",
                            peptide.doseUnit === unit
                              ? "btn-primary-gradient shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-border",
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
                        ? "border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] border"
                        : "border-border bg-muted border",
                    )}
                  >
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-foreground text-base font-bold tracking-tight">
                        {peptides.length > 1 ? "Total Volume" : "Formulate"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-xl font-black tabular-nums",
                            isTotalValid
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {totalUnits.toFixed(1)}
                        </span>
                        <span className="text-foreground2 text-sm font-bold">
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

                    <div className="border-border mt-2 border-t pt-3">
                      <ul className="space-y-3">
                        {results.map((result, index) => (
                          <li
                            key={result.id}
                            className="flex items-start gap-3 text-sm leading-relaxed"
                          >
                            <div className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                            <span className="text-foreground2">
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
                              <div className="bg-muted-foreground/80 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                              <span className="text-muted-foreground font-bold">
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
                    <div className="animate-in fade-in slide-in-from-bottom-2 border-border from-muted to-muted/60 flex items-center gap-2 rounded-lg border bg-gradient-to-r p-3">
                      <div className="bg-border flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                        <span className="text-muted-foreground text-xs font-bold">
                          !
                        </span>
                      </div>
                      <p className="text-foreground2 text-sm">
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
                            className="border-border focus-visible:ring-primary h-9 rounded-xl text-sm focus-visible:ring-1"
                            autoFocus
                          />
                          <button
                            onClick={handleSave}
                            className="btn-primary-gradient h-9 shrink-0 rounded-xl px-4 text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowSaveInput(false);
                              setSaveLabel("");
                            }}
                            className="bg-muted text-muted-foreground hover:bg-border h-9 shrink-0 rounded-xl px-3 text-xs font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSaveInput(true)}
                          className="border-border text-muted-foreground hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-medium transition-colors"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                          Save this calculation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-border from-muted to-muted/60 rounded-2xl border bg-gradient-to-br p-8 text-center">
                  <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Syringe className="text-muted-foreground h-8 w-8" />
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
            className="border-border bg-card text-foreground2 hover:bg-muted flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="text-primary h-4 w-4" />
              Saved Calculations
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                {savedCalculations.length}
              </span>
            </span>
            {showSaved ? (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </button>

          {showSaved && (
            <div className="animate-in fade-in mt-2 space-y-2 duration-200">
              {savedCalculations.map((saved) => (
                <div
                  key={saved.id}
                  className="border-border bg-card flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {saved.label}
                    </p>
                    <p className="text-muted-foreground/80 text-xs">
                      {new Date(saved.savedAt).toLocaleDateString()} ·{" "}
                      {saved.peptides.length} peptide
                      {saved.peptides.length > 1 ? "s" : ""} ·{" "}
                      {saved.syringeValue}U syringe
                    </p>
                  </div>
                  <div className="ml-3 flex shrink-0 gap-2">
                    <button
                      onClick={() => handleLoad(saved)}
                      className="btn-primary-gradient rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(saved.id)}
                      className="bg-muted text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive rounded-lg px-2 py-1.5 transition-colors"
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
