import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const FAQ_ITEMS = [
  {
    category: "RECONSTITUTION",
    items: [
      {
        question: "What is peptide reconstitution and why is it necessary?",
        answer:
          "Peptides are shipped as lyophilized (freeze-dried) powder to preserve stability. Reconstitution is the process of dissolving this powder with bacteriostatic water (BAC water) to create an injectable solution. Without reconstitution, accurate dosing is not possible.",
      },
      {
        question: "How much bacteriostatic water should I add to my vial?",
        answer:
          "There is no single correct volume — it depends on the peptide amount and your desired concentration. Common volumes are 1–3 mL. Adding more water makes each unit on the syringe deliver a smaller dose, which can improve dosing precision. Our Reverse Calculator can help you determine the exact BAC water volume needed to achieve a specific number of units per dose.",
      },
      {
        question: "Can I use sterile water instead of bacteriostatic water?",
        answer:
          "Bacteriostatic water contains 0.9% benzyl alcohol, which inhibits bacterial growth and allows multi-dose use over several weeks. Sterile water lacks this preservative — if used, the entire vial should be consumed within 24 hours and any remainder discarded. For multi-dose protocols, BAC water is strongly recommended.",
      },
      {
        question: "How long do reconstituted peptides remain stable?",
        answer:
          "When reconstituted with bacteriostatic water and stored at 2–8°C (refrigerated), most peptides remain stable for 21–28 days. Avoid freezing reconstituted solutions, keep vials upright, and never expose them to direct sunlight or temperatures above room temperature.",
      },
    ],
  },
  {
    category: "DOSING & SYRINGES",
    items: [
      {
        question: "What syringe size should I use for peptide injections?",
        answer:
          "Insulin syringes in 0.3 mL (30 units), 0.5 mL (50 units), or 1 mL (100 units) are standard. For doses under 30 units, a 0.3 mL syringe offers finer graduation marks and greater precision. Our calculator supports all three sizes and will show you the exact number of units to draw.",
      },
      {
        question: "What is the difference between units, IU, and mL?",
        answer:
          "On an insulin syringe, 'units' refer to the graduation marks — a 100-unit syringe holds 1 mL, so 1 unit = 0.01 mL. IU (International Units) is a pharmacological measure of biological activity, not directly equivalent to syringe units. Our Unit Converter tool can help translate between mL, mg, mcg, and µL.",
      },
      {
        question: "How do I calculate the number of doses in a vial?",
        answer:
          "Divide the total peptide content (in mcg) by your dose per injection. For example, a 5 mg BPC-157 vial contains 5,000 mcg. At 250 mcg per dose, that yields 20 doses. Our Dosage Calculator performs this automatically and also shows the concentration in mg/mL.",
      },
      {
        question: "What does 'concentration' mean and why does it matter?",
        answer:
          "Concentration (mg/mL) describes how much peptide is dissolved per milliliter of solution. It is determined by dividing the total peptide mass by the volume of BAC water added. A higher concentration means each unit on the syringe delivers more peptide — precision matters, especially at microgram-level dosing.",
      },
    ],
  },
  {
    category: "STORAGE & HANDLING",
    items: [
      {
        question: "How should I store unreconstituted peptide vials?",
        answer:
          "Lyophilized peptides should be stored in a cool, dry place. Refrigeration (2–8°C) is ideal for long-term storage. Some peptides can be stored at room temperature short-term, but heat and humidity accelerate degradation. Always check the manufacturer's storage recommendations.",
      },
      {
        question: "What are the signs of peptide degradation?",
        answer:
          "Discoloration, cloudiness, or visible particles in a reconstituted solution may indicate degradation or contamination. A properly reconstituted peptide solution should be clear and colorless. If any of these signs appear, discard the vial and do not use it.",
      },
      {
        question: "Should I swirl or shake the vial when reconstituting?",
        answer:
          "Never shake a peptide vial — agitation can denature the peptide chain and reduce potency. Instead, gently direct the BAC water stream against the glass wall and allow it to dissolve naturally. If needed, roll the vial gently between your palms.",
      },
    ],
  },
  {
    category: "USING THE CALCULATOR",
    items: [
      {
        question: "Is mcgcalc free to use?",
        answer:
          "Yes, completely free — no sign-ups required, no hidden fees. All calculations run entirely in your browser.",
      },
      {
        question: "Does mcgcalc store my personal data?",
        answer:
          "No. We don't collect any personal information. Saved calculations are stored locally in your browser using localStorage — nothing is ever sent to a server.",
      },
      {
        question: "Can I save and revisit my calculations?",
        answer:
          "Yes. The Dosage Calculator includes a save feature that stores calculations locally in your browser. You can label, review, and delete saved calculations from the 'My Calculations' page at any time.",
      },
      {
        question: "What calculators are available on mcgcalc?",
        answer:
          "We offer five tools: a Dosage Calculator for syringe unit calculations, a Reverse Calculator to determine BAC water volume for a target draw, an Intranasal Calculator for nasal spray dosing, an Order Calculator to plan vial quantities for your protocol, and a Unit Converter for quick conversions between mL, mg, mcg, and µL.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <section className="relative py-16 md:py-28 lg:py-32">
        <div className="container">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground mt-4 text-2xl md:text-3xl">
              Peptide reconstitution, dosing & calculator usage
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl space-y-12 md:mt-12 lg:mt-20">
            {FAQ_ITEMS.map((category) => (
              <Card key={category.category} className="border-hidden">
                <CardHeader className="pb-0">
                  <h3 className="text-accent-foreground border-b pb-4 font-mono text-sm font-medium uppercase tracking-widest">
                    {category.category}
                  </h3>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`${category.category}-${i}`}
                        className="border-muted border-b last:border-0"
                      >
                        <AccordionTrigger className="text-base font-medium hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/70 text-sm md:text-base font-medium leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
