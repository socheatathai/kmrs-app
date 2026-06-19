import Image from "next/image";
import Link from "next/link";

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
      data-reveal
      id="resources"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="KMRS App"
              className="h-14 w-14 rounded-xl object-cover"
              height={640}
              src="/logo.png"
              width={640}
            />
            <span className="text-xl font-black">KMRS App</span>
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
