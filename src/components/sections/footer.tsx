import { FaXTwitter, FaLinkedin, FaFacebook } from "react-icons/fa6";

const navigation = [
  {
    title: "Products",
    links: [
      { name: "VAR", href: "/#code-security" },
      { name: "Credit Transfers", href: "/#why-charter" },
      { name: "Credit Accounts", href: "/#ai-chatbot" },
      { name: "Loan Origination", href: "/#ai-chatbot" },
      { name: "Loan Purchase", href: "/#ai-chatbot" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Pricing", href: "/pricing" },
      { name: "FAQ", href: "/faq" },
      { name: "Demo", href: "/contact" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const socialLinks = [
  { icon: FaXTwitter, href: "https://facebook.com" },
  { icon: FaFacebook, href: "https://twitter.com" },
  { icon: FaLinkedin, href: "https://linkedin.com" },
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
            <div className="flex items-center gap-4">
              <img
                src="/images/layout/logomark.svg"
                alt="Charter"
                width={26}
                height={23}
                className="dark:invert"
              />
              <p className="text-sm font-medium">
                © {new Date().getFullYear()} Charter -{" "}
                <a
                  href="https://shadcnblocks.com"
                  className="underline transition-opacity hover:opacity-80"
                  target="_blank"
                >
                  Shadcnblocks.com
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.href}
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
