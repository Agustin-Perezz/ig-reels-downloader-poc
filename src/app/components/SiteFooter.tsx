const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
  { label: "Contact", href: "#contact" },
  { label: "API", href: "#api" },
] as const;

const COPYRIGHT_TEXT =
  "© 2024 InstaSave Downloader. Fast, Secure, and Private.";

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-xl">
      <div className="flex flex-col md:flex-row justify-between items-center py-lg max-w-container-max mx-auto px-gutter">
        <div className="mb-sm md:mb-0">
          <span className="text-body-md text-on-surface">{COPYRIGHT_TEXT}</span>
        </div>
        <div className="flex gap-md flex-wrap justify-center">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-label-sm font-semibold text-on-surface-variant hover:text-on-surface underline decoration-primary decoration-2 underline-offset-4 transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
