import { useState, useCallback, useMemo } from "react"
import { Plus, Trash2, HelpCircle, Beaker, Droplets, Syringe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Peptide {
  id: string
  quantity: number | string
  dose: number | string
  doseUnit: "mcg" | "mg"
}

interface CalculationResult {
  id: string
  volumeMl: number
  units: number
  isValid: boolean
  fillPercentage: number
}

function AnimatedSyringe({
  fillPercentage,
  units,
  isValid,
  maxUnits
}: {
  fillPercentage: number
  units: number
  isValid: boolean
  maxUnits: number
}) {
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100)

  const majorMarks = maxUnits === 100 ? [0, 20, 40, 60, 80, 100]
    : maxUnits === 50 ? [0, 10, 20, 30, 40, 50]
      : [0, 10, 20, 30]

  return (
    <div className="relative w-full py-2">
      <div className="px-2">
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative h-12 bg-slate-100 rounded-none border border-slate-300 overflow-hidden">
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out z-10",
                clampedFill > 0 ? "rounded-none" : "",
                isValid
                  ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba]"
                  : "bg-slate-300"
              )}
              style={{
                width: `${clampedFill}%`,
                ...(!isValid ? {
                  backgroundImage: 'repeating-linear-gradient(45deg, #94a3b8 0, #94a3b8 10px, #cbd5e1 10px, #cbd5e1 20px)'
                } : {})
              }}
            />

            <div className="absolute inset-y-0 left-1 right-1 z-30 pointer-events-none">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100
                const isInLiquid = markPosition <= clampedFill
                return (
                  <span
                    key={mark}
                    className={cn(
                      "absolute top-1/2 text-[10px] font-bold tabular-nums transition-colors duration-300",
                      isInLiquid ? (isValid ? "text-white" : "text-slate-600") : "text-slate-500"
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {mark}
                  </span>
                )
              })}
            </div>

            <div className="absolute top-0 left-1 right-1 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100
                const isInLiquid = markPosition <= clampedFill
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute top-0 w-0.5 transition-colors duration-300",
                      isInLiquid ? (isValid ? "bg-white" : "bg-slate-600") : "bg-slate-400"
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: '14px',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )
              })}
            </div>

            <div className="absolute top-0 left-1 right-1 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100
                const isInLiquid = markPosition <= clampedFill
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-0 transition-colors duration-300",
                      i % 5 === 0 ? "w-0.5 h-3.5" : "w-px h-2",
                      isInLiquid ? (isValid ? "bg-white" : "bg-slate-600") : "bg-slate-300"
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )
              })}
            </div>

            <div className="absolute bottom-0 left-1 right-1 z-20">
              {majorMarks.map((mark, i) => {
                const markPosition = (i / (majorMarks.length - 1)) * 100
                const isInLiquid = markPosition <= clampedFill
                return (
                  <div
                    key={mark}
                    className={cn(
                      "absolute bottom-0 w-0.5 transition-colors duration-300",
                      isInLiquid ? (isValid ? "bg-white" : "bg-slate-600") : "bg-slate-400"
                    )}
                    style={{
                      left: `${markPosition}%`,
                      height: '14px',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )
              })}
            </div>

            <div className="absolute bottom-0 left-1 right-1 z-20">
              {[...Array((majorMarks.length - 1) * 5 + 1)].map((_, i) => {
                const markPosition = (i / ((majorMarks.length - 1) * 5)) * 100
                const isInLiquid = markPosition <= clampedFill
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute bottom-0 transition-colors duration-300",
                      i % 5 === 0 ? "w-0.5 h-3.5" : "w-px h-2",
                      isInLiquid ? (isValid ? "bg-white" : "bg-slate-600") : "bg-slate-300"
                    )}
                    style={{
                      left: `${markPosition}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SYRINGE_VOLUMES = [
  { value: 30, label: "30 units", ml: 0.3 },
  { value: 50, label: "50 units", ml: 0.5 },
  { value: 100, label: "100 units", ml: 1.0 },
]

const WATER_UNITS = ["ml", "IU"] as const

function HelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function PeptideCalculator() {
  const [syringeVolume, setSyringeVolume] = useState(SYRINGE_VOLUMES[0])
  const [peptides, setPeptides] = useState<Peptide[]>([
    { id: generateId(), quantity: 5, dose: 250, doseUnit: "mcg" },
  ])
  const [waterVolume, setWaterVolume] = useState<number | string>(5)
  const [waterUnit, setWaterUnit] = useState<"ml" | "IU">("ml")

  const addPeptide = useCallback(() => {
    if (peptides.length < 5) {
      setPeptides((prev) => [
        ...prev,
        { id: generateId(), quantity: 10, dose: 500, doseUnit: "mcg" },
      ])
    }
  }, [peptides.length])

  const removePeptide = useCallback((id: string) => {
    setPeptides((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updatePeptide = useCallback(
    (id: string, field: keyof Peptide, value: number | string) => {
      setPeptides((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      )
    },
    []
  )

  const results = useMemo((): CalculationResult[] | null => {
    const waterVolNum = Number(waterVolume) || 0
    const waterMl = waterUnit === "IU" ? waterVolNum / 100 : waterVolNum

    const hasValidPeptide = peptides.some(p => (Number(p.quantity) || 0) > 0 && (Number(p.dose) || 0) > 0)
    if (!hasValidPeptide || waterMl <= 0) {
      return null
    }

    return peptides.map((peptide) => {
      const doseNum = Number(peptide.dose) || 0
      const quantNum = Number(peptide.quantity) || 0

      const doseMg = peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum
      const concentrationMgPerMl = quantNum / waterMl
      const volumeNeededMl = concentrationMgPerMl > 0 ? doseMg / concentrationMgPerMl : 0
      const units = (volumeNeededMl / syringeVolume.ml) * syringeVolume.value
      const fillPercentage = (units / syringeVolume.value) * 100

      return {
        id: peptide.id,
        volumeMl: volumeNeededMl,
        units: Math.round(units * 10) / 10,
        isValid: units > 0 && units <= syringeVolume.value,
        fillPercentage,
      }
    })
  }, [peptides, waterVolume, waterUnit, syringeVolume])

  const totalUnits = useMemo(() => {
    if (!results) return 0
    return results.reduce((sum, r) => sum + r.units, 0)
  }, [results])

  const totalFillPercentage = useMemo(() => {
    return (totalUnits / syringeVolume.value) * 100
  }, [totalUnits, syringeVolume.value])

  const isTotalValid = totalUnits > 0 && totalUnits <= syringeVolume.value

  return (
    <div className="w-full max-w-xl mx-auto selection:bg-[#2bb3ba]/30">
      <div className="bg-card rounded-2xl shadow-lg shadow-slate-200/50 border border-border/50 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Syringe Volume */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Syringe className="h-5 w-5" />
              <span className="font-bold text-sm">Select the Total Syringe Volume</span>
              <HelpTooltip content="Select the total volume of the syringe you are using. Common sizes are 0.3mL (30 units), 0.5mL (50 units), and 1mL (100 units)." />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800">Volume</Label>
              <div className="flex gap-2 w-3/5">
                {SYRINGE_VOLUMES.map((vol) => (
                  <button
                    key={vol.value}
                    onClick={() => setSyringeVolume(vol)}
                    className={cn(
                      "flex-1 px-4 h-12 rounded-xl text-sm font-bold transition-all duration-200",
                      syringeVolume.value === vol.value
                        ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-md border-transparent"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                <span className="font-bold text-sm">Enter the Quantity of Peptide</span>
                <HelpTooltip content="Enter total milligrams (mg) per vial. You can add up to 5 peptides." />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addPeptide}
                disabled={peptides.length >= 5}
                className="h-8 text-xs gap-1.5 font-bold shadow-sm hover:border-transparent hover:bg-gradient-to-r hover:from-[#11696f] hover:to-[#2bb3ba] hover:text-white transition-all duration-300"
              >
                <Plus className="h-3.5 w-3.5" />
                ADD PEPTIDE
              </Button>
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="flex items-center justify-between animate-in fade-in duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-800">
                      Peptide {index + 1}
                    </span>
                    {peptides.length > 1 && (
                      <button
                        onClick={() => removePeptide(peptide.id)}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center w-3/5">
                    <div className="relative w-full">
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        value={peptide.quantity}
                        onChange={(e) => {
                          let val = e.target.value
                          if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
                            val = val.replace(/^0+(?=\d)/, '')
                          }
                          updatePeptide(peptide.id, "quantity", val)
                        }}
                        className="h-12 w-full text-center pr-12 text-lg font-bold bg-[#1e3a5f]/5 border-transparent focus-visible:ring-1 focus-visible:ring-[#2bb3ba] rounded-xl selection:bg-[#2bb3ba] selection:text-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        mg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Volume */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Droplets className="h-5 w-5" />
              <span className="font-bold text-sm">Enter the Quantity of Bacteriostatic Water</span>
              <HelpTooltip content="Enter the volume of Bacteriostatic Water added. Choose ml or IU." />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-slate-800">Water</Label>
              <div className="flex gap-3 w-3/5">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={waterVolume}
                    onChange={(e) => {
                      let val = e.target.value
                      if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
                        val = val.replace(/^0+(?=\d)/, '')
                      }
                      setWaterVolume(val)
                    }}
                    className="h-12 text-center text-lg font-bold bg-[#1e3a5f]/5 border-transparent focus-visible:ring-1 focus-visible:ring-[#2bb3ba] rounded-xl selection:bg-[#2bb3ba] selection:text-white"
                  />
                </div>
                <div className="flex shrink-0">
                  {WATER_UNITS.map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setWaterUnit(unit)}
                      className={cn(
                        "px-4 h-12 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl",
                        waterUnit === unit
                          ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
              <span className="font-bold text-sm">Enter the Quantity of Peptide in each dose</span>
              <HelpTooltip content="Enter the required dose for each peptide. Choose mcg or mg as unit." />
            </div>

            <div className="space-y-4">
              {peptides.map((peptide, index) => (
                <div
                  key={peptide.id}
                  className="flex items-center justify-between animate-in fade-in duration-300"
                >
                  <Label className="text-xl font-bold text-slate-800">
                    Peptide {index + 1}
                  </Label>
                  <div className="flex gap-3 w-3/5">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={peptide.dose}
                        onChange={(e) => {
                          let val = e.target.value
                          if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.')) {
                            val = val.replace(/^0+(?=\d)/, '')
                          }
                          updatePeptide(peptide.id, "dose", val)
                        }}
                        className="h-12 text-center text-lg font-bold bg-[#1e3a5f]/5 border-transparent focus-visible:ring-1 focus-visible:ring-[#2bb3ba] rounded-xl selection:bg-[#2bb3ba] selection:text-white"
                      />
                    </div>
                    <div className="flex shrink-0">
                      {(["mcg", "mg"] as const).map((unit) => (
                        <button
                          key={unit}
                          onClick={() => updatePeptide(peptide.id, "doseUnit", unit)}
                          className={cn(
                            "px-4 h-12 text-sm font-bold transition-all duration-200 first:rounded-l-xl last:rounded-r-xl",
                            peptide.doseUnit === unit
                              ? "bg-gradient-to-r from-[#11696f] to-[#2bb3ba] text-white shadow-sm"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
          <div className="pt-4 border-t border-border/50">
            {results ? (
              <div className="space-y-4">
                <div className={cn(
                  "rounded-2xl p-6 transition-all duration-500",
                  isTotalValid
                    ? "bg-[#11696f]/[0.03] border border-[#2bb3ba]/20"
                    : "bg-slate-50 border border-slate-200"
                )}>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-lg font-bold text-slate-800 tracking-tight">
                      {peptides.length > 1 ? "Total Volume" : "Formulate"}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-2xl font-black tabular-nums",
                        isTotalValid ? "text-[#11696f]" : "text-slate-500"
                      )}>
                        {totalUnits.toFixed(1)}
                      </span>
                      <span className="text-base font-bold text-slate-700">units</span>
                    </div>
                  </div>

                  <AnimatedSyringe
                    fillPercentage={totalFillPercentage}
                    units={totalUnits}
                    isValid={isTotalValid}
                    maxUnits={syringeVolume.value}
                  />

                  <div className="mt-2 pt-3 border-t border-slate-200/60">
                    <ul className="space-y-3">
                      {results.map((result, index) => (
                        <li key={result.id} className="flex items-start gap-3 text-sm leading-relaxed">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#11696f] shrink-0" />
                          <span className="text-slate-700">
                            Draw <strong>{result.units} units</strong> for <strong>{peptides[index].dose}{peptides[index].doseUnit}</strong> doses{peptides.length > 1 ? ` of Peptide ${index + 1}` : ""}
                          </span>
                        </li>
                      ))}
                      {peptides.map((peptide, index) => {
                        const doseNum = Number(peptide.dose) || 0
                        const quantNum = Number(peptide.quantity) || 0
                        const waterVolNum = Number(waterVolume) || 0

                        const doseMg = peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum
                        const waterMl = waterUnit === "IU" ? waterVolNum / 100 : waterVolNum
                        const concentrationMgPerMl = waterMl > 0 ? quantNum / waterMl : 0
                        const totalDosesNum = doseMg > 0 ? (quantNum / doseMg) : 0

                        const formatDoses = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2)

                        return (
                          <li key={`conc-${peptide.id}`} className="flex items-start gap-3 text-sm leading-relaxed animate-in fade-in duration-500">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400/80 shrink-0" />
                            <span className="text-slate-600 font-bold">
                              With a concentration of <strong>{concentrationMgPerMl.toFixed(2)}mg/mL</strong>, {peptides.length > 1 ? `Peptide ${index + 1} ` : ""}vial contains ~<strong>{formatDoses(totalDosesNum)} doses</strong> in {waterMl}mL.
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>

                {!isTotalValid && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-slate-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      Total injection volume exceeds syringe capacity, please adjust doses or use a larger syringe.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200/50 flex items-center justify-center">
                  <Syringe className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter valid values to see results
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Results will update in real time as you type
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
