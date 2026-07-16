// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // IMPORTANT for Vercel Deployment: 
  // Update this 'site' URL to your actual production domain (e.g., "https://mcgcalc.com" or "https://<your-project>.vercel.app") 
  // Otherwise, the generated sitemap for SEO will generate links with example.com!
  site: "https://mcgcalc.com",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/saved/"),
    }),
    react(),
  ],
  output: "static",

  markdown: {
    // Dual-theme syntax highlighting. defaultColor: "light" bakes the light
    // theme inline (so code blocks match the page in light mode) and emits
    // --shiki-dark CSS variables that global.css applies under .dark.
    // Without this, Astro defaults to github-dark and renders a black box
    // on the white light-mode page.
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: "light",
      wrap: true,
    },
  },

  redirects: {
    "/calculator": "/peptide-calculator",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400", "500", "600", "700"],
    },
    {
      provider: fontProviders.google(),
      name: "Hubot Sans",
      cssVariable: "--font-sans",
      weights: ["400", "500", "600", "700"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-mono",
      weights: ["400", "500", "600", "700"],
    },
    {
      provider: fontProviders.google(),
      name: "Mona Sans",
      cssVariable: "--font-mona",
      weights: ["500"],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
