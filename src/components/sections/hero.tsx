import { Syringe, ChevronRight } from "lucide-react";
import { CALCULATORS } from "@/consts";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  syringe: Syringe,
} as const;

export default function Hero() {
  return (
    <section className="bg-background relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-28">
      <div className="relative z-10">
        <div className="container max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            mcgcalc
          </h1>
          <p className="text-muted-foreground font-mona mt-4 text-balance text-xl md:text-2xl">
            Peptide &amp; Dosage Calculators
          </p>
        </div>

        <div className="container mt-12 max-w-3xl md:mt-16">
          <div className="grid grid-cols-1 gap-4">
            {CALCULATORS.map((calc) => {
              const Icon = ICON_MAP[calc.icon];
              return (
                <a
                  key={calc.href}
                  href={calc.href}
                  className={cn(
                    "bg-card border-border/50 group flex items-start gap-4 rounded-2xl border p-5 shadow-sm",
                    "transition-all duration-200 hover:border-[#3b82f6]/40 hover:shadow-md",
                  )}
                >
                  <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                        {calc.title}
                      </h2>
                      {"badge" in calc && calc.badge && (
                        <span className="rounded-full bg-[#1d4ed8]/10 px-2 py-0.5 text-xs font-bold text-[#1d4ed8]">
                          {calc.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {calc.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-5 shrink-0 text-slate-300 transition-colors group-hover:text-[#1d4ed8]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
