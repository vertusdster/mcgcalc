import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string().optional(),
    authorImage: z.string().optional(),
    authorName: z.string().optional(),
    category: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }),
});

const peptides = defineCollection({
  loader: glob({ base: "./src/content/peptides", pattern: "**/*.md" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    defaultDose: z.number(),       // mcg
    defaultVialSize: z.number(),   // mg
    molecularWeight: z.string().optional(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog, peptides };
