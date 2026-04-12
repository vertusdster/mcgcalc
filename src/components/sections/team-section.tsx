const team = [
  {
    name: "Dr. Sarah Chen",
    role: "Lead Scientific Advisor",
    bio: "Biochemistry PhD with over 10 years of experience in peptide synthesis and pharmacokinetics research. Former research associate at the Institute of Molecular Biology, specializing in peptide stability and reconstitution protocols.",
    credentials: ["PhD Biochemistry", "Peptide Research", "Pharmacokinetics"],
  },
  {
    name: "James Whitfield",
    role: "Lead Developer",
    bio: "Full-stack engineer focused on building accurate, privacy-first health tools. Background in biomedical engineering with a passion for making complex calculations accessible to researchers and practitioners.",
    credentials: ["Biomedical Engineering", "Software Development"],
  },
];

export function TeamSection() {
  return (
    <>
      <section className="container relative max-w-5xl py-10 md:py-16 lg:py-20">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            Our Team
          </h1>
          <p className="text-muted-foreground font-mona mt-4 max-w-xl text-xl md:text-2xl">
            The people behind mcgcalc's peptide calculators.
          </p>
        </div>
      </section>

      <section className="container max-w-5xl pb-10 md:pb-16 lg:pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border bg-card p-8 shadow-sm"
            >
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] dark:text-[#60a5fa] text-lg font-bold">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{member.name}</h2>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </div>
              </div>
              <p className="mt-4 text-base leading-relaxed">{member.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.credentials.map((cred) => (
                  <span
                    key={cred}
                    className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container max-w-5xl border-t py-10 md:py-16 lg:py-20">
        <div className="max-w-xl space-y-5">
          <h2 className="font-mona text-2xl font-medium tracking-tight md:text-3xl">
            Editorial process
          </h2>
          <p className="text-lg">
            All calculator formulas are validated against standard reconstitution references. Peptide profiles are reviewed for accuracy by our scientific advisor before publication. Content is updated regularly to reflect current research.
          </p>
          <p className="text-muted-foreground text-sm">
            Have a correction or suggestion? Reach us at{" "}
            <a href="mailto:contact@mcgcalc.com" className="text-[#1d4ed8] dark:text-[#60a5fa] underline hover:opacity-80">
              contact@mcgcalc.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
