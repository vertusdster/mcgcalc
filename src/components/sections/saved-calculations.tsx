import { useState, useEffect, useRef } from "react";
import { Trash2, Pencil, Check, X, Syringe, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSyringe } from "@/components/elements/animated-syringe";
import {
  loadSavedCalculations,
  deleteSavedCalculation,
  updateSavedCalculation,
  computeResults,
  getSyringeVolume,
} from "@/lib/saved-calculations";
import type { SavedCalculation } from "@/lib/saved-calculations";

export function SavedCalculations() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCalculations(loadSavedCalculations());
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDelete = (id: string) => {
    setCalculations(deleteSavedCalculation(id));
  };

  const startEdit = (saved: SavedCalculation) => {
    setEditingId(saved.id);
    setEditLabel(saved.label);
  };

  const confirmEdit = () => {
    if (editingId && editLabel.trim()) {
      setCalculations(updateSavedCalculation(editingId, { label: editLabel.trim() }));
    }
    setEditingId(null);
    setEditLabel("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };
  if (calculations.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700/50">
            <Syringe className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-600">No saved calculations yet</p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Save a calculation from the{" "}
            <a href="/calculator" className="text-[#1d4ed8] underline hover:text-[#3b82f6]">
              Dosage Calculator
            </a>{" "}
            to see it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      {calculations.map((saved) => {
        const { results, totalUnits } = computeResults(saved);
        const syringe = getSyringeVolume(saved.syringeValue);
        const totalFill = (totalUnits / syringe.value) * 100;
        const isTotalValid = totalUnits > 0 && totalUnits <= syringe.value;
        const waterVolNum = Number(saved.waterVolume) || 0;
        const waterMl = saved.waterUnit === "IU" ? waterVolNum / 100 : waterVolNum;

        return (
          <div
            key={saved.id}
            className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none"
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <Syringe className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
                  {editingId === saved.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="h-7 rounded-md border border-slate-200 dark:border-slate-800 px-2 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#3b82f6]"
                      />
                      <button onClick={confirmEdit} className="rounded p-1 text-blue-600 hover:bg-blue-50">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={cancelEdit} className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                      {saved.label}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Saved
                  </span>
                  {editingId !== saved.id && (
                    <>
                      <button
                        onClick={() => startEdit(saved)}
                        className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#1d4ed8]"
                        aria-label="Edit label"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(saved.id)}
                        className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Syringe */}
              <AnimatedSyringe
                fillPercentage={totalFill}
                units={totalUnits}
                isValid={isTotalValid}
                maxUnits={syringe.value}
              />

              {/* Details */}
              <ul className="mt-3 space-y-2">
                {results.map((result, index) => {
                  const peptide = saved.peptides[index];
                  const doseNum = Number(peptide.dose) || 0;
                  const quantNum = Number(peptide.quantity) || 0;
                  const doseMg = peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum;
                  const concentrationMgPerMl = waterMl > 0 ? quantNum / waterMl : 0;
                  const totalDosesNum = doseMg > 0 ? quantNum / doseMg : 0;
                  const formatDoses = (num: number) =>
                    Number.isInteger(num) ? num.toString() : num.toFixed(1);

                  return (
                    <li key={result.id} className="space-y-1">
                      <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1d4ed8]" />
                        <span>
                          Draw <strong>{result.units} units</strong> for{" "}
                          <strong>{peptide.dose}{peptide.doseUnit}</strong> doses
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400/80" />
                        <span>
                          With a concentration of <strong>{concentrationMgPerMl.toFixed(1)}mg/mL</strong>,
                          each vial contains {formatDoses(totalDosesNum)} doses
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                        <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400/80" />
                        <span>or {result.volumeMl.toFixed(2)} doses in mL</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-bold">{new Date(saved.savedAt).toLocaleDateString("en-CA")}</span>
                  <span>{saved.peptides.length} peptide{saved.peptides.length > 1 ? "s" : ""}</span>
                </div>
                <span
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-bold text-white",
                    isTotalValid
                      ? "bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] dark:bg-none dark:bg-white"
                      : "bg-slate-400",
                  )}
                >
                  {totalUnits.toFixed(1)} units
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
