export function AboutSection() {
  return (
    <>
      {/* Hero Section */}
      <section className="container relative max-w-5xl py-10 md:py-16 lg:py-20">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            About mcgcalc
          </h1>
          <p className="text-muted-foreground font-mona mt-4 max-w-xl text-xl md:text-2xl">
            Free, open tools for precise peptide reconstitution and dosage calculations.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container max-w-5xl border-y py-5">
        <div className="mt-6 grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl">
              5
            </h3>
            <p className="text-muted-foreground mt-1 font-medium">Calculators</p>
          </div>
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl">
              0
            </h3>
            <p className="text-muted-foreground mt-1 font-medium">Data collected</p>
          </div>
          <div>
            <h3 className="text-4xl font-medium tracking-tight md:text-5xl">
              100%
            </h3>
            <p className="text-muted-foreground mt-1 font-medium">Client-side</p>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="container max-w-5xl py-10 md:py-16 lg:py-20">
        <div className="max-w-xl space-y-5 md:space-y-8">
          <h2 className="font-mona text-2xl font-medium tracking-tight md:text-3xl">
            Why we built mcgcalc
          </h2>
          <p className="text-lg">
            Peptide reconstitution math is straightforward, but getting it wrong has real consequences. Miscalculating a concentration or drawing the wrong number of units can mean the difference between an effective protocol and a wasted vial — or worse.
          </p>
          <p className="text-lg">
            We built mcgcalc because the existing tools were either cluttered with ads, required account sign-ups, or sent your data to remote servers. We wanted something simple: enter your values, get accurate results, move on.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container max-w-5xl pb-10 md:pb-16 lg:pb-20">
        <div className="max-w-xl space-y-5 md:space-y-8">
          <h2 className="font-mona text-2xl font-medium tracking-tight md:text-3xl">
            How it works
          </h2>
          <p className="text-lg">
            Every calculation runs entirely in your browser. No server requests, no databases, no tracking. When you save a calculation, it stays in your browser's local storage — we never see it.
          </p>
          <p className="text-lg">
            The suite includes five tools: a Dosage Calculator for syringe unit calculations, a Reverse Calculator to determine BAC water volume, an Intranasal Calculator for nasal spray formulations, an Order Calculator to plan vial quantities across a protocol, and a Unit Converter for quick conversions between mL, mg, mcg, and µL.
          </p>
        </div>
      </section>

      {/* Principles Section */}
      <section className="container max-w-5xl border-t py-10 md:py-16 lg:py-20">
        <div className="max-w-xl space-y-5 md:space-y-8">
          <h2 className="font-mona text-2xl font-medium tracking-tight md:text-3xl">
            Our principles
          </h2>
          <ul className="space-y-4 text-lg">
            <li>
              <strong>Privacy first.</strong> We don't collect personal data. No analytics cookies, no fingerprinting. Core calculators are always free.
            </li>
            <li>
              <strong>Accuracy matters.</strong> Calculations are validated against standard reconstitution formulas. Results update in real time as you type.
            </li>
            <li>
              <strong>Free, no strings.</strong> No premium tiers, no paywalls, no "sign up to unlock." Every feature is available to everyone.
            </li>
            <li>
              <strong>For research purposes.</strong> This tool is intended for educational and informational use. Always consult a qualified healthcare professional for medical decisions.
            </li>
          </ul>
          <p className="text-lg">
            <a href="/about/team" className="text-[#1d4ed8] dark:text-[#60a5fa] underline hover:opacity-80">
              Meet the team
            </a>{" "}
            behind mcgcalc.
          </p>
        </div>
      </section>
    </>
  );
}
