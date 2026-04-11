import { Mail } from "lucide-react";

export function ContactPage() {
  return (
    <section className="py-16 md:py-28 lg:py-32">
      <div className="container max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Contact
          </h1>
          <p className="text-muted-foreground mt-4 text-xl md:text-2xl">
            Questions, feedback, or bug reports — we'd love to hear from you.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 md:mt-16">
          <a
            href="mailto:info@mcgcalc.com"
            className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-8 py-6 shadow-sm transition-all hover:border-[#3b82f6]/40 hover:shadow-md"
          >
            <Mail className="h-6 w-6 text-[#1d4ed8] dark:text-[#60a5fa]" />
            <span className="text-lg font-semibold">info@mcgcalc.com</span>
          </a>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            We typically respond within 24–48 hours. For calculator issues, please include the values you entered and the expected result.
          </p>
        </div>
      </div>
    </section>
  );
}
