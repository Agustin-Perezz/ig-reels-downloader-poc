import { Download, Moon } from "lucide-react";

const NAV_LINKS = [
  { label: "FAQ", href: "#faq" },
  { label: "Features", href: "#features" },
  { label: "How to Use", href: "#how-to-use" },
] as const;

export function TopNavBar() {
  return (
    <nav className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant">
      <div className="flex justify-between items-center h-20 max-w-container-max mx-auto px-gutter w-full">
        <div className="flex items-center gap-sm">
          <Download className="size-7 text-primary" />
          <span className="font-bold text-primary text-2xl">InstaSave</span>
        </div>
        <div className="hidden md:flex items-center gap-lg">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-on-surface-variant font-medium hover:text-on-surface transition-colors duration-200 text-label-sm font-semibold"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-md">
          <button
            type="button"
            className="text-on-surface-variant font-medium hover:text-on-surface transition-colors duration-200 text-label-sm"
          >
            English
          </button>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            <Moon className="size-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
