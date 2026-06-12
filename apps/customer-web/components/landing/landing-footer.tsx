import Link from "next/link";
import { QrCode } from "lucide-react";

type FooterLink = {
  href: string;
  label: string;
};

type FooterLinkGroup = {
  heading: string;
  links: FooterLink[];
};

type LandingFooterProps = {
  linkGroups: FooterLinkGroup[];
};

export function LandingFooter({ linkGroups }: LandingFooterProps) {
  return (
    <footer
      className="scroll-mt-20 bg-[#0F172A] px-4 py-10 text-white sm:px-6 lg:px-8"
      id="resources"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <QrCode className="h-6 w-6" />
            </span>
            <span className="text-xl font-black">KMRS</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-300">
            Digital menu platform for local businesses.
          </p>
        </div>

        {linkGroups.map(({ heading, links }) => (
          <div key={heading}>
            <h3 className="text-sm font-black">{heading}</h3>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
              {links.map((item) => (
                <a
                  className="transition hover:text-white"
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
