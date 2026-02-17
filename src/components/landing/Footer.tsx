import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/data";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground border-t border-white/10 py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="text-white font-bold text-xl tracking-tight block mb-3"
            >
              {siteConfig.name}
            </Link>
            <p className="text-sm text-muted-2 leading-relaxed">
              {siteConfig.fullName}
            </p>
            <p className="text-xs text-muted-2 mt-2">
              {siteConfig.company}
            </p>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-2 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-2 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm text-muted-2 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-2">
            &copy; {currentYear} {siteConfig.company}. All rights reserved.
          </p>
          <p className="text-xs text-muted-2">
            Reg: {siteConfig.companyReg} &middot; {siteConfig.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
