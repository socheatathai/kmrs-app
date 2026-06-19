"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

type LandingHeaderProps = {
  loginHref: string;
  navItems: NavItem[];
  startFreeHref: string;
};

function HeaderLogo() {
  return (
    <Link
      aria-label="KMRS App home"
      className="group flex items-center gap-2.5"
      href="/"
    >
      <Image
        alt="KMRS App"
        className="h-12 w-12 rounded-xl object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
        height={640}
        priority
        src="/logo.png"
        width={640}
      />
      <span className="hidden text-xl font-black tracking-[-0.04em] text-slate-950 min-[390px]:block">
        KMRS App
      </span>
    </Link>
  );
}

export function LandingHeader({
  loginHref,
  navItems,
  startFreeHref,
}: LandingHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("demo");

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateActiveSection = () => {
      const headerOffset = 130;
      let currentSection = sections[0]?.id ?? "demo";

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= headerOffset) {
          currentSection = section.id;
        } else {
          break;
        }
      }

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [navItems]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={`mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 sm:px-5 ${
          scrolled
            ? "border-slate-200/80 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.1)] backdrop-blur-xl"
            : "border-white/70 bg-white/65 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-lg"
        }`}
      >
        <HeaderLogo />

        <div className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-slate-50/80 p-1 text-sm font-bold text-slate-600 lg:flex">
          {navItems.map((item) => (
            <a
              aria-current={
                activeSection === item.href.replace("#", "")
                  ? "page"
                  : undefined
              }
              className={`rounded-full px-4 py-2 transition duration-200 ${
                activeSection === item.href.replace("#", "")
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            href={loginHref}
          >
            Login
          </Link>
          <Link
            className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
            href={startFreeHref}
          >
            Start Free
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          aria-label="Open navigation"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm sm:hidden"
          onClick={() => setDrawerOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 animate-[fade-in_180ms_ease-out] sm:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeDrawer}
            type="button"
          />
          <aside className="absolute right-0 top-0 flex h-dvh w-[min(21rem,88vw)] animate-[drawer-in_260ms_cubic-bezier(.2,.8,.2,1)] flex-col bg-[#FAFAF9] shadow-[-24px_0_70px_rgba(15,23,42,0.24)]">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <HeaderLogo />
              <button
                aria-label="Close navigation"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-950"
                onClick={closeDrawer}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-5 text-base font-black text-slate-800">
              {navItems.map((item) => (
                <a
                  aria-current={
                    activeSection === item.href.replace("#", "")
                      ? "page"
                      : undefined
                  }
                  className={`rounded-xl px-3 py-3 transition ${
                    activeSection === item.href.replace("#", "")
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                  href={item.href}
                  key={item.label}
                  onClick={closeDrawer}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="grid gap-3 border-t border-slate-200 p-4">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900"
                href={loginHref}
                onClick={closeDrawer}
              >
                Login
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm"
                href={startFreeHref}
                onClick={closeDrawer}
              >
                Start Free
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
