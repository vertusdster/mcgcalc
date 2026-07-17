import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Pencil,
  Check,
  X,
  Syringe,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSyringe } from "@/components/elements/animated-syringe";
import {
  loadSavedCalculations,
  deleteSavedCalculation,
  updateSavedCalculation,
  computeResults,
  getSyringeVolume,
  LOAD_KEY,
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
      setCalculations(
        updateSavedCalculation(editingId, { label: editLabel.trim() }),
      );
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
        <div className="border-border from-muted to-muted/60 rounded-2xl border bg-gradient-to-br p-8 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Syringe className="text-muted-foreground h-8 w-8" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            No saved calculations yet
          </p>
          <p className="text-muted-foreground/80 mt-1 text-xs">
            Save a calculation from the{" "}
            <a
              href="/peptide-calculator"
              className="text-primary hover:text-primary/80 underline"
            >
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
        const waterMl =
          saved.waterUnit === "IU" ? waterVolNum / 100 : waterVolNum;

        return (
          <div
            key={saved.id}
            className="bg-card border-border/50 overflow-hidden rounded-2xl border shadow-lg shadow-slate-200/50 dark:shadow-none"
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <Syringe className="text-muted-foreground h-5 w-5 shrink-0" />
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
                        className="border-border bg-background text-foreground focus:border-primary h-7 rounded-md border px-2 text-sm font-semibold outline-none"
                      />
                      <button
                        onClick={confirmEdit}
                        className="text-primary hover:bg-primary/10 rounded p-1"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-muted-foreground hover:bg-muted rounded p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-foreground truncate text-lg font-bold">
                      {saved.label}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Saved
                  </span>
                  {editingId !== saved.id && (
                    <>
                      <button
                        onClick={() => startEdit(saved)}
                        className="text-muted-foreground hover:bg-muted hover:text-primary rounded-lg p-1.5 transition-colors"
                        aria-label="Edit label"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(saved.id)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors"
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
                  const doseMg =
                    peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum;
                  const concentrationMgPerMl =
                    waterMl > 0 ? quantNum / waterMl : 0;
                  const totalDosesNum = doseMg > 0 ? quantNum / doseMg : 0;
                  const formatDoses = (num: number) =>
                    Number.isInteger(num) ? num.toString() : num.toFixed(1);

                  return (
                    <li key={result.id} className="space-y-1">
                      <div className="text-foreground2 flex items-start gap-2 text-sm leading-relaxed">
                        <div className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                        <span>
                          Draw <strong>{result.units} units</strong> for{" "}
                          <strong>
                            {peptide.dose}
                            {peptide.doseUnit}
                          </strong>{" "}
                          doses
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
                        <div className="bg-muted-foreground/80 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                        <span>
                          With a concentration of{" "}
                          <strong>
                            {concentrationMgPerMl.toFixed(1)}mg/mL
                          </strong>
                          , each vial contains {formatDoses(totalDosesNum)}{" "}
                          doses
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
                        <div className="bg-muted-foreground/80 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                        <span>or {result.volumeMl.toFixed(2)} doses in mL</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span className="font-bold">
                    {new Date(saved.savedAt).toLocaleDateString("en-CA")}
                  </span>
                  <span>
                    {saved.peptides.length} peptide
                    {saved.peptides.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/peptide-calculator"
                    onClick={() => {
                      try {
                        localStorage.setItem(LOAD_KEY, saved.id);
                      } catch {}
                    }}
                    className="btn-primary-gradient flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Load
                  </a>
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-bold",
                      isTotalValid
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {totalUnits.toFixed(1)} units
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
