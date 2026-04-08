export interface Peptide {
  id: string;
  quantity: number | string;
  dose: number | string;
  doseUnit: "mcg" | "mg";
}

export interface SavedCalculation {
  id: string;
  label: string;
  savedAt: string;
  syringeValue: number;
  waterVolume: number | string;
  waterUnit: "ml" | "IU";
  peptides: Peptide[];
}

export interface CalculationResult {
  id: string;
  volumeMl: number;
  units: number;
  isValid: boolean;
  fillPercentage: number;
}

export const STORAGE_KEY = "peptide-saved-calculations";

export const SYRINGE_VOLUMES = [
  { value: 30, label: "30 units", ml: 0.3 },
  { value: 50, label: "50 units", ml: 0.5 },
  { value: 100, label: "100 units", ml: 1.0 },
] as const;

export function loadSavedCalculations(): SavedCalculation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function persistSavedCalculations(list: SavedCalculation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function deleteSavedCalculation(id: string): SavedCalculation[] {
  const list = loadSavedCalculations().filter((s) => s.id !== id);
  persistSavedCalculations(list);
  return list;
}

export function updateSavedCalculation(
  id: string,
  updates: Partial<Pick<SavedCalculation, "label">>,
): SavedCalculation[] {
  const list = loadSavedCalculations().map((s) =>
    s.id === id ? { ...s, ...updates } : s,
  );
  persistSavedCalculations(list);
  return list;
}

export function getSyringeVolume(value: number) {
  return SYRINGE_VOLUMES.find((v) => v.value === value) ?? SYRINGE_VOLUMES[0];
}

export function computeResults(
  saved: SavedCalculation,
): { results: CalculationResult[]; totalUnits: number; syringeMl: number } {
  const syringe = getSyringeVolume(saved.syringeValue);
  const waterVolNum = Number(saved.waterVolume) || 0;
  const waterMl = saved.waterUnit === "IU" ? waterVolNum / 100 : waterVolNum;

  const results: CalculationResult[] = saved.peptides.map((peptide) => {
    const doseNum = Number(peptide.dose) || 0;
    const quantNum = Number(peptide.quantity) || 0;
    const doseMg = peptide.doseUnit === "mcg" ? doseNum / 1000 : doseNum;
    const concentrationMgPerMl = waterMl > 0 ? quantNum / waterMl : 0;
    const volumeNeededMl =
      concentrationMgPerMl > 0 ? doseMg / concentrationMgPerMl : 0;
    const units = (volumeNeededMl / syringe.ml) * syringe.value;
    const fillPercentage = (units / syringe.value) * 100;

    return {
      id: peptide.id,
      volumeMl: volumeNeededMl,
      units: Math.round(units * 10) / 10,
      isValid: units > 0 && units <= syringe.value,
      fillPercentage,
    };
  });

  const totalUnits = results.reduce((sum, r) => sum + r.units, 0);
  return { results, totalUnits, syringeMl: syringe.ml };
}
