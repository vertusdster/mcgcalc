import { ChevronRight, FlaskConical, Syringe, Calculator } from "lucide-react";
import { PlusSigns } from "../icons/plus-signs";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Calculator,
    title: "Instant Calculation",
    description:
      "Enter your vial quantity, BAC water, and target dose — get exact syringe units in real time.",
  },
  {
    icon: Syringe,
    title: "Visual Syringe Guide",
    description:
      "Animated syringe scale shows exactly where to draw, eliminating guesswork.",
  },
  {
    icon: FlaskConical,
    title: "Multi-Peptide Support",
    description:
      "Calculate up to 5 peptides in a single session. Supports mg, mcg, mL, and IU units.",
  },
];

export default function Hero() {
  return (
    <section className="bg-background relative overflow-hidden pt-16 md:pt-28 lg:pt-32">
      <div className="relative z-10">
        <div className="container max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            Free Peptide Dosage Calculator
          </h1>
          <p className="text-muted-foreground font-mona mt-4 text-balance text-xl md:text-2xl">
            Calculate the exact units to draw for any peptide. Enter your vial
            quantity, BAC water, and target dose — get instant, accurate
            results.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="/peptide-calculator">
                Calculate Now
                <ChevronRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/peptides">Browse Peptides</a>
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="container mt-16 max-w-5xl md:mt-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border-border/50 rounded-2xl border p-6 text-left shadow-sm"
              >
                <div className="bg-primary/10 mb-4 flex size-10 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary size-5" />
                </div>
                <h2 className="font-inter mb-2 text-lg font-bold">
                  {feature.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="container mt-20 max-w-5xl pb-20 md:mt-28 md:pb-28 lg:pb-32">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Reconstitute",
                desc: "Add bacteriostatic water to your peptide vial and enter the amounts.",
              },
              {
                step: "2",
                title: "Enter Your Dose",
                desc: "Input your target dose in mcg or mg and select your syringe size.",
              },
              {
                step: "3",
                title: "Draw Exactly",
                desc: "The calculator tells you exactly how many units to draw — no math required.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <a href="/peptide-calculator">
                Try the Calculator — It&apos;s Free
                <ChevronRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 aspect-square [mask-image:radial-gradient(circle_at_center,black_0%,black_20%,transparent_75%)]">
        <PlusSigns className="text-foreground/[0.05] h-full w-full" />
      </div>
      <div>
        <div className="bg-primary-gradient/11 absolute inset-x-[0%] bottom-0 left-0 h-[500px] rounded-full blur-[100px] will-change-transform md:h-[950px]" />
        <div className="bg-secondary-gradient/9 absolute inset-x-[30%] bottom-0 right-0 h-[500px] rounded-full blur-[100px] will-change-transform md:h-[950px]" />
      </div>
    </section>
  );
}
