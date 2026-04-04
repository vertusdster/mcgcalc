export const SITE_TITLE = "Peptide Calculator";
export const SITE_DESCRIPTION =
  "Free online peptide dosage calculator. Instantly calculate the exact injection volume for your peptide dose based on vial quantity, bacteriostatic water, and desired dose.";

export const SITE_METADATA = {
  title: {
    default: SITE_TITLE,
    template: "%s | Peptide Calculator",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "peptide calculator",
    "peptide dosage calculator",
    "bacteriostatic water",
    "peptide injection",
    "syringe units",
    "peptide reconstitution",
    "BPC-157",
    "TB-500",
  ],
  authors: [{ name: "Peptide Calculator" }],
  creator: "Peptide Calculator",
  publisher: "Peptide Calculator",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "48x48" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Peptide Calculator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Peptide Dosage Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};
