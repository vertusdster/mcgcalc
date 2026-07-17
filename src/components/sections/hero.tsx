import { Syringe, ChevronRight } from "lucide-react";
import { CALCULATORS } from "@/consts";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  syringe: Syringe,
} as const;

export default function Hero() {
  return (
    <section className="bg-background relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-28">
      <div className="relative z-10">
        <div className="container hidden max-w-5xl text-center md:block">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            mcgcalc
          </h1>
          <p className="text-muted-foreground font-mona mt-4 text-balance text-xl md:text-2xl">
            Peptide & Dosage Calculators
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
                    "hover:border-primary/40 transition-all duration-200 hover:shadow-md",
                  )}
                >
                  <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-foreground text-base font-bold">
                        {calc.title}
                      </h2>
                      {"badge" in calc && calc.badge && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                          {calc.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {calc.description}
                    </p>
                  </div>
                  <ChevronRight className="text-border group-hover:text-primary mt-1 size-5 shrink-0 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
