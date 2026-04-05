import { FaXTwitter, FaLinkedin } from "react-icons/fa6";

const navigation = [
  {
    title: "Tools",
    links: [
      { name: "Peptide Calculator", href: "/calculator" },
      { name: "Peptides List", href: "/peptides" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "FAQ", href: "/faq" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const socialLinks = [
  { icon: FaXTwitter, href: "https://twitter.com", label: "X / Twitter" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="pt-16 md:pt-28 lg:pt-32">
      <div className="container">
        {/* Navigation Section */}
        <nav className="flex max-w-5xl flex-wrap justify-between gap-x-32 gap-y-20 border-b pb-14 lg:pb-20">
          {navigation.map((section) => (
            <div key={section.title}>
              <h2 className="font-inter mb-6 font-medium lg:text-lg">
                {section.title}
              </h2>
              <ul className="space-y-6">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-muted-foreground lg:text-lg"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="max-w-5xl py-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              © {new Date().getFullYear()} PeptideCalculator.com — For research
              purposes only.
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.label}
                  key={link.href}
                  href={link.href}
                  className="hover:text-muted-foreground"
                >
                  <link.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
