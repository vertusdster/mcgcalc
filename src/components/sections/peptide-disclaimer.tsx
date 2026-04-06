import { ShieldAlert } from "lucide-react";

interface DisclaimerProps {
  /** "strict" = full RESEARCH CHEMICAL ONLY box; "brief" = one-line footer note */
  type?: "strict" | "brief";
}

export function Disclaimer({ type = "strict" }: DisclaimerProps) {
  if (type === "brief") {
    return (
      <p className="text-muted-foreground mt-8 border-t pt-3 text-xs">
        FOR RESEARCH PURPOSES ONLY. Not for human consumption. Not for
        veterinary use. Not a drug, food, or cosmetic.
      </p>
    );
  }

  return (
    <div className="my-6 rounded-xl border-2 border-amber-400/60 bg-amber-50/80 px-5 py-4 dark:border-amber-500/40 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
          <p className="font-bold uppercase tracking-wide">
            ⚠ RESEARCH CHEMICAL ONLY — FOR IN VITRO / LABORATORY USE
          </p>
          <p className="mt-2">
            This information is provided exclusively for educational and
            scientific reference purposes.{" "}
            <strong>
              This compound is NOT approved by the FDA or any regulatory agency
              for human or veterinary use.
            </strong>{" "}
            Administration into living organisms is{" "}
            <strong>FORBIDDEN BY LAW</strong> in many jurisdictions without
            appropriate licensure. All data presented here is sourced from
            peer-reviewed literature and is intended solely for{" "}
            <em>in vitro</em> (outside-the-body) research contexts.
          </p>
          <p className="mt-2">
            This website does not provide medical advice, diagnosis, or
            treatment. Consult a licensed physician before making any
            health-related decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
