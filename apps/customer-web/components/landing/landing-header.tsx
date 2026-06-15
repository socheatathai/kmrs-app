"use client";

import Link from "next/link";
import { ChevronDown, Menu, QrCode, X } from "lucide-react";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

type LandingHeaderProps = {
  loginHref: string;
  navItems: NavItem[];
  resourcesHref: string;
  startFreeHref: string;
};

function HeaderLogo() {
  return (
    <Link className="flex items-center gap-3" href="/">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
        <QrCode className="h-6 w-6" />
      </span>
      <span className="text-xl font-black tracking-normal text-slate-950">
        KMRS
      </span>
    </Link>
  );
}

export function LandingHeader({
  loginHref,
  navItems,
  resourcesHref,
  startFreeHref,
}: LandingHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerItems = [...navItems, { href: resourcesHref, label: "Resources" }];

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#FAFAF9]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <HeaderLogo />

        <div className="hidden items-center gap-8 text-sm font-bold text-slate-700 lg:flex">
          {navItems.map((item) => (
            <a
              className="transition hover:text-emerald-600"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
          <a
            className="inline-flex items-center gap-1 transition hover:text-emerald-600"
            href={resourcesHref}
          >
            Resources
            <ChevronDown className="h-4 w-4" />
          </a>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-black text-slate-800 transition hover:bg-slate-100"
            href={loginHref}
          >
            Login
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
            href={startFreeHref}
          >
            Start Free
          </Link>
        </div>

        <button
          aria-label="Open navigation"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm sm:hidden"
          onClick={() => setDrawerOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40"
            onClick={closeDrawer}
            type="button"
          />
          <aside className="absolute right-0 top-0 flex h-dvh w-[min(20rem,86vw)] flex-col bg-[#FAFAF9] shadow-[-24px_0_70px_rgba(15,23,42,0.24)]">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <HeaderLogo />
              <button
                aria-label="Close navigation"
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-950"
                onClick={closeDrawer}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-5 text-base font-black text-slate-800">
              {drawerItems.map((item) => (
                <a
                  className="rounded-lg px-3 py-3 transition hover:bg-emerald-50 hover:text-emerald-700"
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
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-900"
                href={loginHref}
                onClick={closeDrawer}
              >
                Login
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-black text-white shadow-sm"
                href={startFreeHref}
                onClick={closeDrawer}
              >
                Start Free
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
