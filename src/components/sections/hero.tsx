import {
  ChevronRight,
  Wallet,
  Waypoints,
  Building2,
  ArrowLeftRight,
} from "lucide-react";

import { PlusSigns } from "../icons/plus-signs";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  {
    id: "var",
    title: "Virtual Account",
    description: "Sed do eiusmod tempor incididunt ut labore",
    icon: Wallet,
    image: "/images/homepage/hero/1.webp",
  },
  {
    id: "wire",
    title: "Wire",
    description: "Sed do eiusmod tempor incididunt ut labore",
    icon: Waypoints,
    image: "/images/homepage/hero/2.webp",
  },
  {
    id: "bank-accounts",
    title: "Bank Accounts",
    description: "Sed do eiusmod tempor incididunt ut labore",
    icon: Building2,
    image: "/images/homepage/hero/3.webp",
  },
  {
    id: "bank-transfers",
    title: "Bank Transfers",
    description: "Sed do eiusmod tempor incididunt ut labore",
    icon: ArrowLeftRight,
    image: "/images/homepage/hero/4.webp",
  },
];

export default function Hero() {
  return (
    <section className="bg-background relative overflow-hidden pt-16 md:pt-28 lg:pt-32">
      <div className="relative z-10">
        <div className="container max-w-5xl text-center">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl">
            Secure. Composable. Bankable.
          </h1>
          <p className="text-muted-foreground font-mona mt-4 text-balance text-2xl md:text-3xl">
            Charter is the fit-for-purpose developer API for building robust,
            encrypted finance products.
          </p>
          <div className="mt-7">
            <Button asChild size="lg">
              <a href="/signup">
                Start building for free
                <ChevronRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        {features.map((feature) => (
          <img
            key={feature.id}
            src={feature.image}
            alt={feature.title}
            className="lg:translate-y-15 hidden size-full translate-y-8 object-contain"
          />
        ))}
        <Tabs defaultValue="var" className="mt-8 md:mt-12 lg:mt-20">
          {/* Tab Content */}
          <div className="container">
            {features.map((feature) => (
              <TabsContent
                key={feature.id}
                value={feature.id}
                className="relative aspect-[2.116/1] overflow-hidden"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="lg:translate-y-15 size-full translate-y-8 object-contain"
                />
              </TabsContent>
            ))}
          </div>

          {/* Tab Triggers */}
          <div className="bg-background pb-16 pt-12 md:pb-28 lg:pb-32">
            <TabsList className="mx-auto flex h-auto max-w-4xl justify-start gap-4 overflow-x-auto bg-transparent max-lg:px-5">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="ring-secondary-foreground group min-w-[200px] flex-1 justify-start whitespace-normal rounded-lg px-4 py-3 text-start transition-colors duration-300 data-[state=active]:bg-transparent data-[state=active]:ring lg:px-6 lg:py-4"
                >
                  <div className="flex flex-col">
                    <div className="bg-muted-foreground/40 group-data-[state=active]:bg-secondary-foreground flex size-8 items-center justify-center rounded-md p-1.5">
                      <feature.icon className="stroke-background" />
                    </div>
                    <h2 className="group-data-[state=active]:text-primary font-inter text-foreground mt-2 text-lg font-bold">
                      {feature.title}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 aspect-square [mask-image:radial-gradient(circle_at_center,black_0%,black_20%,transparent_75%)]">
        <PlusSigns className="text-foreground/[0.05] h-full w-full" />
      </div>
      <div className="">
        {/* will-change-transform improves performance on scroll on safari because of the high blur */}
        <div className="bg-primary-gradient/11 absolute inset-x-[0%] bottom-0 left-0 h-[500px] rounded-full blur-[100px] will-change-transform md:h-[950px]" />
        <div className="bg-secondary-gradient/9 absolute inset-x-[30%] bottom-0 right-0 h-[500px] rounded-full blur-[100px] will-change-transform md:h-[950px]" />
      </div>
    </section>
  );
}
