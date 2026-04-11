import React, { useState, useEffect } from "react";

import { ChevronRight, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/lib/saved-calculations";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../elements/theme-toggle";

const Navbar = ({ currentPage }: { currentPage: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const pathname = currentPage;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        setHasSaved(Array.isArray(list) && list.length > 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const ITEMS = [
    ...(hasSaved
      ? [{ label: "My Calculations", href: "/saved" }]
      : []),
    { label: "Home", href: "/" },
    {
      label: "Calculators",
      href: "/calculator",
      dropdownItems: [
        {
          title: "Dosage Calculator",
          description: "Calculate exact syringe units for your peptide dose.",
          href: "/calculator",
        },
        {
          title: "Reverse Calculator",
          description: "Find the right BAC water volume for a target draw amount.",
          href: "/reverse-calculator",
        },
        {
          title: "Intranasal Calculator",
          description: "Nasal spray dosage calculations made simple.",
          href: "/intranasal-calculator",
        },
        {
          title: "Order Calculator",
          description: "Plan how many vials you need for your protocol.",
          href: "/order-calculator",
        },
        {
          title: "Unit Converter",
          description: "Convert between ml, mg, uL, and mcg instantly.",
          href: "/unit-converter",
        },
      ],
    },
    { label: "Peptides", href: "/peptides" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className={"relative z-50"}>
      <div className="container max-w-5xl lg:pt-10">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/images/layout/logo.svg"
              alt="logo"
              width={128}
              height={23}
              className="dark:[filter:brightness(0)_saturate(100%)_invert(100%)]"
            />
          </a>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden items-center gap-8 lg:flex" delayDuration={200}>
            <NavigationMenuList>
              {ITEMS.map((link) =>
                link.dropdownItems ? (
                  <NavigationMenuItem key={link.label}>
                    <NavigationMenuTrigger className="bg-transparent font-normal lg:text-base">
                      {link.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="flex gap-6 p-6">
                      <NavDropdownImage />
                      <ul className="w-[400px]">
                        {link.dropdownItems.map((item) => (
                          <li key={item.title}>
                            <NavigationMenuLink asChild>
                              <a
                                href={item.href}
                                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-hidden flex select-none items-center gap-4 rounded-md p-3 leading-none no-underline transition-colors"
                              >
                                <div>
                                  <div className="text-sm font-medium leading-none">
                                    {item.title}
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {item.description}
                                  </p>
                                </div>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={link.label}>
                    <a
                      href={link.href}
                      className={cn(
                        "hover:text-accent-foreground dark:hover:text-white p-2 lg:text-base",
                        pathname === link.href && "text-accent-foreground dark:text-white",
                      )}
                    >
                      {link.label}
                    </a>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href="/calculator"
              className={`transition-opacity duration-300 ${isMenuOpen ? "max-lg:pointer-events-none max-lg:opacity-0" : "opacity-100"}`}
            >
              <Button
                variant="outline"
                className="dark:bg-white dark:text-slate-900"
              >
                Peptide Calculator
              </Button>
            </a>

            <div
              className={`transition-opacity duration-300 ${isMenuOpen ? "max-lg:pointer-events-none max-lg:opacity-0" : "opacity-100"}`}
            >
              <ThemeToggle className="dark:bg-white dark:text-slate-900" />
            </div>

            {/* Hamburger Menu Button (Mobile Only) */}
            <button
              className="relative flex size-8 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="absolute left-1/2 top-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "bg-background container absolute inset-0 top-full flex h-[calc(100vh-64px)] flex-col transition-all duration-300 ease-in-out lg:hidden",
          isMenuOpen
            ? "visible translate-x-0 opacity-100"
            : "invisible translate-x-full opacity-0",
        )}
      >
        <div className="mt-8 space-y-2">
          <a
            href="/calculator"
            className="block"
            onClick={() => setIsMenuOpen(false)}
          >
            <Button size="sm" className="w-full">
              Open Calculator
            </Button>
          </a>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-6">
          {ITEMS.map((link) =>
            link.dropdownItems ? (
              <div key={link.label} className="">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.label ? null : link.label,
                    )
                  }
                  className="flex w-full items-center justify-between text-lg font-medium tracking-[-0.36px]"
                  aria-label={`${link.label} menu`}
                  aria-expanded={openDropdown === link.label}
                >
                  {link.label}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openDropdown === link.label ? "rotate-90" : "",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={cn(
                    "ml-4 space-y-3 overflow-hidden transition-all",
                    openDropdown === link.label
                      ? "mt-3 max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  {link.dropdownItems.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="hover:bg-accent flex items-start gap-3 rounded-md p-2"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "text-lg tracking-[-0.36px]",
                  pathname === link.href && "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
          <a
            href="/about"
            className={cn(
              "text-lg tracking-[-0.36px]",
              pathname === "/about" && "text-muted-foreground",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

const NavDropdownImage = () => {
  return (
    <div className="from-primary-900 via-primary to-primary/90 bg-linear-to-r flex flex-col gap-2 rounded-xl text-white">
      <div className="space-y-1 p-5 font-medium">
        <h3>Peptide Calculators</h3>
        <p className="text-white/80 text-sm">
          Dosing, reconstitution & unit conversion — all in one place
        </p>
      </div>
      <img
        src="/images/layout/circles.svg"
        alt="circles"
        width={288}
        height={80}
      />

      <Button
        asChild
        variant="outline"
        className="group m-5 bg-transparent font-semibold"
      >
        <a href="/#launch-today">
          Learn more
          <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </Button>
    </div>
  );
};
