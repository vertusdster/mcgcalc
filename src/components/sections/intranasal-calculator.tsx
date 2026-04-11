import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { HelpCircle, Beaker, Droplets, SprayCan, FlaskConical } from "lucide-react";
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
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-l-xl bg-slate-100 dark:bg-slate-800/80 text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] active:bg-[#1d4ed8]/20 dark:active:bg-[#60a5fa]/20"
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
          className="h-12 w-full border-y border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 text-center text-lg font-bold text-slate-800 dark:text-slate-200 outline-none selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40 focus:border-[#3b82f6] focus:bg-white dark:text-white"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-r-xl bg-slate-100 dark:bg-slate-800/80 text-xl font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-[#1d4ed8]/10 hover:text-[#1d4ed8] active:bg-[#1d4ed8]/20 dark:active:bg-[#60a5fa]/20"
      >
        +
      </button>
    </div>
  );
}

const SPRAY_VOLUME_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30];

export function IntranasalCalculator() {
  // === Vial Version ===
  const [massInVial, setMassInVial] = useState<number | string>(100);
  const [diluentVolume, setDiluentVolume] = useState<number | string>(10);
  const [volumePerSpray, setVolumePerSpray] = useState<number | string>(0.1);
  const [desiredDose, setDesiredDose] = useState<number | string>(5);
  const [doseUnit, setDoseUnit] = useState<"mg" | "mcg">("mg");

  // === Powder Version ===
  const [powderDose, setPowderDose] = useState<number | string>(500);
  const [numberOfDoses, setNumberOfDoses] = useState<number | string>(60);
  const [powderSprayVol, setPowderSprayVol] = useState<number | string>(0.15);
  const [spraysPerDose, setSpraysPerDose] = useState<number | string>(1);

  // === Spray Volume Helper ===
  const [helperWaterMl, setHelperWaterMl] = useState(5);

  // Vial version calculation
  const vialResult = useMemo(() => {
    const mass = Number(massInVial) || 0;
    const diluent = Number(diluentVolume) || 0;
    const sprayVol = Number(volumePerSpray) || 0;
    const dose = Number(desiredDose) || 0;

    if (mass <= 0 || diluent <= 0 || sprayVol <= 0 || dose <= 0) return null;

    const concentrationMgPerMl = mass / diluent;
    const peptidePerSprayMg = concentrationMgPerMl * sprayVol;
    const peptidePerSprayMcg = peptidePerSprayMg * 1000;

    const doseMg = doseUnit === "mcg" ? dose / 1000 : dose;
    const spraysNeeded = peptidePerSprayMg > 0 ? doseMg / peptidePerSprayMg : 0;
    const totalSpraysAvailable = sprayVol > 0 ? diluent / sprayVol : 0;

    return {
      peptidePerSprayMg: Math.round(peptidePerSprayMg * 1000) / 1000,
      peptidePerSprayMcg: Math.round(peptidePerSprayMcg * 100) / 100,
      spraysNeeded: Math.round(spraysNeeded * 10) / 10,
      spraysNeededCeil: Math.ceil(spraysNeeded),
      totalSpraysAvailable: Math.round(totalSpraysAvailable),
      doseMg,
      massStr: mass,
      diluentStr: diluent,
      sprayVolStr: sprayVol,
    };
  }, [massInVial, diluentVolume, volumePerSpray, desiredDose, doseUnit]);

  // Powder version calculation
  const powderResult = useMemo(() => {
    const dose = Number(powderDose) || 0;
    const doses = Number(numberOfDoses) || 0;
    const sprayVol = Number(powderSprayVol) || 0;
    const sprays = Number(spraysPerDose) || 0;

    if (dose <= 0 || doses <= 0 || sprayVol <= 0 || sprays <= 0) return null;

    const totalMcg = dose * doses * sprays;
    const totalG = totalMcg / 1_000_000;
    const totalMg = totalMcg / 1000;
    const volumeRequired = doses * sprays * sprayVol;

    return {
      powderG: Math.round(totalG * 1000) / 1000,
      powderMg: Math.round(totalMg * 100) / 100,
      volumeMl: Math.round(volumeRequired * 100) / 100,
    };
  }, [powderDose, numberOfDoses, powderSprayVol, spraysPerDose]);

  // Spray volume helper
  const helperResult = useMemo(() => {
    const sprayVol = 0.1; // standard 0.1ml per spray
    const numSprays = helperWaterMl / sprayVol;
    return {
      numSprays: Math.round(numSprays),
      sprayVolume: sprayVol,
    };
  }, [helperWaterMl]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 selection:bg-[#3b82f6]/30 dark:selection:bg-[#3b82f6]/40">
      {/* === Vial Version === */}
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-5 p-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 dark:text-white">
            Vial Version
          </h2>

          {/* Mass in Vial */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Mass in Vial{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">(mg)</span>
              </span>
              <HelpTooltip content="Total mass of peptide in the vial in milligrams." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={massInVial}
                stepMode="small"
                min={0}
                suffix="mg"
                onChange={(val) => setMassInVial(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Diluent Volume */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Diluent Volume{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">(ml)</span>
              </span>
              <HelpTooltip content="Volume of bacteriostatic water or saline added to the vial." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={diluentVolume}
                stepMode="small"
                min={0}
                suffix="ml"
                onChange={(val) => setDiluentVolume(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Volume/Spray */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Volume/Spray{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">(ml)</span>
              </span>
              <HelpTooltip content="Volume per spray pump actuation. Standard nasal sprayers deliver ~0.1 ml per spray." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={volumePerSpray}
                stepMode="small"
                min={0}
                suffix="ml"
                onChange={(val) => setVolumePerSpray(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Desired Dose */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Desired Dose
              </span>
              <HelpTooltip content="The dose you want to administer per session." />
            </div>
            <div className="flex w-3/5 gap-2">
              <NumberInput
                value={desiredDose}
                stepMode="small"
                min={0}
                onChange={(val) => setDesiredDose(val)}
                className="flex-1"
              />
              <div className="flex shrink-0" role="group" aria-label="Dose unit">
                {(["mg", "mcg"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setDoseUnit(unit)}
                    aria-pressed={doseUnit === unit}
                    className={cn(
                      "h-12 px-4 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl",
                      doseUnit === unit
                        ? "bg-gradient-to-r from-[#1d4ed8] dark:from-slate-200 to-[#3b82f6] dark:to-slate-400 text-white dark:text-slate-900 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vial Result */}
          <div className="border-border/50 border-t pt-4">
            {vialResult ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#1e3a5f]/5 dark:bg-slate-900/50 p-4">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Peptide per Spray:{" "}
                    <strong className="text-[#1d4ed8]">
                      {vialResult.peptidePerSprayMg} mg ({vialResult.peptidePerSprayMcg} mcg)
                    </strong>
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Sprays Needed:{" "}
                    <strong className="text-[#1d4ed8]">
                      {vialResult.spraysNeededCeil}
                    </strong>{" "}
                    <span className="text-slate-400 dark:text-slate-500">(≈ {vialResult.spraysNeeded})</span>
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Approx. Total Sprays Available:{" "}
                    <strong className="text-[#1d4ed8]">
                      {vialResult.totalSpraysAvailable}
                    </strong>
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-[#1e3a5f]/10 to-[#3b82f6]/10 p-4">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 dark:text-slate-300">
                    Given you have{" "}
                    <strong>{vialResult.diluentStr}ml</strong> of deionized water
                    with <strong>{vialResult.massStr}mg</strong> of your peptide,
                    and one spray is typically{" "}
                    <strong>{vialResult.sprayVolStr}ml</strong>, each spray will
                    contain{" "}
                    <strong>{vialResult.peptidePerSprayMg}mg</strong> of your
                    peptide. For your requested dose of{" "}
                    <strong>
                      {desiredDose} {doseUnit}
                    </strong>
                    , take{" "}
                    <strong>{vialResult.spraysNeededCeil} sprays</strong> to
                    achieve this.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Enter valid values above to see results.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* === Powder Version === */}
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-5 p-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 dark:text-white">
            Powder Version
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Desired Dose{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">(mcg)</span>
              </span>
              <HelpTooltip content="The desired dose per administration in micrograms." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={powderDose}
                stepMode="large"
                min={0}
                suffix="mcg"
                onChange={(val) => setPowderDose(val)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Number of Doses
              </span>
              <HelpTooltip content="Total number of doses you want to prepare." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={numberOfDoses}
                stepMode="large"
                min={0}
                onChange={(val) => setNumberOfDoses(val)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Volume/Spray{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">(ml)</span>
              </span>
              <HelpTooltip content="Volume of each spray pump actuation in ml." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={powderSprayVol}
                stepMode="small"
                min={0}
                suffix="ml"
                onChange={(val) => setPowderSprayVol(val)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                Sprays per Dose
              </span>
              <HelpTooltip content="Number of sprays needed per single dose." />
            </div>
            <div className="w-3/5">
              <NumberInput
                value={spraysPerDose}
                stepMode="small"
                min={0}
                onChange={(val) => setSpraysPerDose(val)}
                className="w-full"
              />
            </div>
          </div>

          {/* Powder Result */}
          <div className="border-border/50 border-t pt-4">
            {powderResult ? (
              <div className="rounded-xl bg-[#1e3a5f]/5 dark:bg-slate-900/50 p-4">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Powder Required:{" "}
                  <strong className="text-[#1d4ed8]">
                    {powderResult.powderG} g
                  </strong>{" "}
                  <span className="text-slate-400 dark:text-slate-500">
                    ({powderResult.powderMg} mg)
                  </span>
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Volume Required:{" "}
                  <strong className="text-[#1d4ed8]">
                    {powderResult.volumeMl} ml
                  </strong>
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Enter valid values above to see results.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* === Spray Volume Helper === */}
      <div className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-5 p-6">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 dark:text-white">
            Spray Volume Helper
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                ML of Water
              </span>
              <HelpTooltip content="Total ml of water used in the spray bottle." />
            </div>
            <div className="w-3/5">
              <select
                value={helperWaterMl}
                onChange={(e) => setHelperWaterMl(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-[#1e3a5f]/5 dark:bg-slate-900/50 px-4 text-center text-lg font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#3b82f6] dark:text-white"
              >
                {SPRAY_VOLUME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-[#1e3a5f]/5 dark:bg-slate-900/50 p-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
              No. of Sprays:{" "}
              <strong className="text-[#1d4ed8]">
                {helperResult.numSprays}
              </strong>
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">
              Spray Volume (ml):{" "}
              <strong className="text-[#1d4ed8]">
                {helperResult.sprayVolume}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
