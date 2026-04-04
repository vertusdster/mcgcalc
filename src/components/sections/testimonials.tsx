import { useEffect, useState } from "react";

import { PlusSigns } from "../icons/plus-signs";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Charter's platform delivers unmatched speed, a flexible account framework, and an API-first design. Their deep understanding of the ecosystem has been crucial for scaling our financial operations effectively.",
    author: "Henry Francis",
    role: "Founder, Ramp",
    logo: "/images/logos/ramp.svg",
  },
  {
    id: 2,
    quote:
      "We have a deep understanding of the ecosystem, and Charter delivers unmatched speed, a flexible account framework, and an API-first design. These features are crucial for creating revenue that grows our office plants.",
    author: "David Chen",
    role: "Head of Engineering, Notion",
    logo: "/images/logos/notion.svg",
  },
  {
    id: 3,
    quote:
      "Charter's platform has exceeded our expectations with its seamless integration process and exceptional support team. Their powerful tools and robust infrastructure have been instrumental in our scaling journey.",
    author: "Sarah Williams",
    role: "CTO, Mercury",
    logo: "/images/logos/mercury.svg",
  },
  {
    id: 4,
    quote:
      "Charter has revolutionized how we manage our financial infrastructure effectively. Their API-first approach and robust platform capabilities have given us the flexibility to build custom solutions at scale seamlessly and efficiently.",
    author: "Michael Ross",
    role: "CEO, Raycast",
    logo: "/images/logos/raycast.svg",
  },
  {
    id: 5,
    quote:
      "The combination of Charter's flexible platform architecture and exceptional support team has been transformative for our operations. Their speed, reliability, and scalability are unmatched in the industry.",
    author: "Emily Chen",
    role: "Product Lead, Asana",
    logo: "/images/logos/asana.svg",
  },
];

export default function Testimonials() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      className="relative py-16 md:py-28 lg:py-32"
      aria-label="Customer Testimonials"
    >
      <div className="container max-w-4xl">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          setApi={setApi}
        >
          <CarouselContent>
            {TESTIMONIALS.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="flex cursor-grab flex-col gap-6 lg:gap-8"
              >
                <blockquote className="pointer-events-none select-none text-balance font-sans text-2xl font-semibold leading-tight tracking-tight md:text-3xl lg:text-4xl">
                  {testimonial.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  {testimonial.logo && (
                    <div className="relative h-8 w-24">
                      <img
                        src={testimonial.logo}
                        alt={`${testimonial.author}'s company logo`}
                        className="size-full object-contain dark:invert"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="bg-border h-8 w-[1px]" aria-hidden="true" />
                  <div>
                    <cite className="font-semibold not-italic">
                      {testimonial.author}
                    </cite>
                    <p className="text-muted-foreground text-sm font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div
          className="mt-10 flex gap-2 lg:mt-16"
          role="tablist"
          aria-label="Testimonials navigation"
        >
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              className={cn(
                "size-4 cursor-pointer rounded-full transition-colors duration-300",
                index === current
                  ? "bg-muted-foreground"
                  : "bg-muted-foreground/20 hover:bg-muted-foreground/50",
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-selected={index === current}
              role="tab"
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 top-16 isolate z-[-1] h-[300px] md:top-28 lg:top-32">
        <div className="from-background via-background/40 absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t to-transparent" />
        <div className="from-background via-background/40 absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b to-transparent" />
        <PlusSigns className="text-foreground/[0.05] size-full" />
      </div>
    </section>
  );
}
