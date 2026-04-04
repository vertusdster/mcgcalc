import { ChevronRight, Check } from "lucide-react";

import { PlusSigns } from "../icons/plus-signs";

import { Button } from "@/components/ui/button";

export default function LaunchPricing() {
  return (
    <section
      id="launch-today"
      className="text-background py-16 md:container md:max-w-5xl md:py-28 lg:py-32"
    >
      <div className="from-primary-900 to-primary/90 divide-background/20 bg-linear-to-r container relative isolate grid items-center overflow-hidden py-8 max-lg:gap-10 max-md:gap-6 md:rounded-3xl lg:grid-cols-2 lg:divide-x lg:px-8">
        <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,black_50%,transparent_100%)]">
          <PlusSigns className="text-background/[0.05] h-full w-full" />
        </div>
        <div className="lg:py-16 lg:pr-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Launch today
          </h2>
          <p className="text-background/70 mt-3 text-sm font-medium">
            In the past, new financial companies had to rely on expensive
            middleware that linked them to outdated sponsor bank systems,
            restricting their potential. Our API solves this today.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 max-md:hidden">
            <Button size="lg" variant="secondary" className="group" asChild>
              <a href="/signup">
                Start for free
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button size="lg" className="bg-secondary-foreground group" asChild>
              <a href="/contact">
                Get a demo
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:py-10 lg:pl-20">
          <div>
            <h3 className="text-background text-3xl font-semibold md:text-4xl lg:text-5xl">
              $29.99
            </h3>
            <p className="text-background/70 mt-1 text-xl font-medium">
              per user per month
            </p>
          </div>
          <ul className="text-background/70 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Check className="size-4" />
              All free plan features and...
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4" />
              Mainline AI
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4" />
              Unlimited teams
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-4 md:hidden">
            <Button size="lg" variant="secondary" className="group w-full">
              <a href="/signup" className="flex items-center gap-2">
                Start building for free
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button
              size="lg"
              className="bg-secondary-foreground border-background/20 group w-full border"
            >
              <a href="/contact" className="flex items-center gap-2">
                Get a demo
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
