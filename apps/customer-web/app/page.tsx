import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowRight,
  BarChart3,
  Check,
  Cloud,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Utensils,
  Zap,
} from "lucide-react";

import { LandingDashboardPreview } from "@/components/landing/landing-dashboard-preview";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingMotion } from "@/components/landing/landing-motion";
import { LandingPhonePreview } from "@/components/landing/landing-phone-preview";
import { getPublicQrCode } from "@/lib/api";

const sampleShopSlug = "sunrise-cafe";
const sampleMenuHref = `/${sampleShopSlug}`;

const navItems = [
  { label: "Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const footerLinkGroups = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Support", href: "#resources" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "#resources" },
      { label: "About", href: "#features" },
    ],
  },
];

function normalizeHref(value: string) {
  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://") ||
    trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("#")
  ) {
    return trimmedValue;
  }

  if (
    trimmedValue.startsWith("localhost") ||
    trimmedValue.startsWith("127.0.0.1")
  ) {
    return `http://${trimmedValue}`;
  }

  return `https://${trimmedValue}`;
}

function appendPath(href: string, path: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    const url = new URL(href);
    url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
    return url.toString();
  }

  return `${href.replace(/\/$/, "")}${path}`;
}

function envHref(value: string | undefined, fallback: string) {
  return normalizeHref(value?.trim() ? value : fallback);
}

function getMerchantBaseHref(publicOrigin: string) {
  const url = new URL(normalizeHref(publicOrigin));
  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3001";
  }

  if (hostname === "uat.kmrs.tech") {
    return "https://uat-merchant.kmrs.tech";
  }

  if (hostname === "kmrs.tech" || hostname === "www.kmrs.tech") {
    return "https://merchant.kmrs.tech";
  }

  return url.origin;
}

async function getPublicOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.PUBLIC_MENU_BASE_URL ?? "http://localhost:3000";
}

function getLandingLinks(publicOrigin: string) {
  const merchantHref = envHref(
    process.env.NEXT_PUBLIC_MERCHANT_CMS_URL,
    getMerchantBaseHref(publicOrigin),
  );
  const loginHref = envHref(
    process.env.NEXT_PUBLIC_MERCHANT_LOGIN_URL,
    appendPath(merchantHref, "/login"),
  );
  const startFreeHref = envHref(
    process.env.NEXT_PUBLIC_START_FREE_URL ??
      process.env.NEXT_PUBLIC_MERCHANT_REGISTER_URL,
    appendPath(merchantHref, "/register"),
  );

  return { loginHref, startFreeHref };
}

const stats = [
  { icon: ShoppingBag, value: "100+", label: "Products Managed" },
  { icon: Globe2, value: "2 Languages", label: "Khmer & English" },
  { icon: Zap, value: "Instant", label: "QR Access" },
  { icon: Cloud, value: "24/7", label: "Cloud Hosted" },
];

const features = [
  {
    icon: Smartphone,
    title: "QR Menus",
    copy: "Customers scan and browse instantly.",
  },
  {
    icon: Utensils,
    title: "Product Management",
    copy: "Update menu items anytime.",
  },
  {
    icon: Globe2,
    title: "Multi Language",
    copy: "Khmer and English support.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    copy: "Track menu visits and scans.",
  },
  {
    icon: ShieldCheck,
    title: "Secure",
    copy: "Role-based access control.",
  },
  {
    icon: Cloud,
    title: "Cloud Hosted",
    copy: "No installation required.",
  },
];

const dashboardItems = [
  "Products",
  "Categories",
  "QR Codes",
  "Shops",
  "Orders",
  "Subscriptions",
];

const flowSteps = [
  { icon: Store, title: "Create shop", copy: "Set up your shop profile." },
  { icon: Utensils, title: "Add products", copy: "Add categories and items." },
  { icon: QrCode, title: "Generate QR", copy: "Create a scannable menu." },
  { icon: Smartphone, title: "Customer scans", copy: "Open from any phone." },
  {
    icon: LayoutDashboard,
    title: "Menu opens instantly",
    copy: "Browse without an app.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "A simple way to launch your first digital menu.",
    features: ["1 Shop", "20 Products", "QR menu included"],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$10",
    featured: true,
    description: "Everything a growing restaurant needs.",
    features: ["Unlimited Products", "Staff Management", "Menu analytics"],
    cta: "Choose Pro",
  },
  {
    name: "Business",
    price: "$20",
    description: "Built for teams managing multiple locations.",
    features: ["Multi Shop", "Advanced Features", "Priority support"],
    cta: "Choose Business",
  },
];

function getFallbackQrCode() {
  const url = "https://kmrs.tech/sunrise-cafe";
  const label = encodeURIComponent("Sunrise Cafe sample menu");

  return {
    id: null,
    name: "Sample QR",
    url,
    imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(url)}&qzone=2&format=svg&label=${label}`,
  };
}

async function getSampleQrCode() {
  try {
    return await getPublicQrCode(sampleShopSlug);
  } catch {
    return getFallbackQrCode();
  }
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition-colors duration-200 hover:bg-emerald-600 sm:px-6"
      href={href}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-950 shadow-sm backdrop-blur transition-colors duration-200 hover:border-slate-300 hover:bg-white sm:px-6"
      href={href}
    >
      {children}
      <ExternalLink className="h-4 w-4" />
    </Link>
  );
}

export default async function Home() {
  const sampleQrCode = await getSampleQrCode();
  const { loginHref, startFreeHref } = getLandingLinks(await getPublicOrigin());

  return (
    <main className="min-h-screen overflow-x-clip bg-[#FAFAF9] text-[#111827]">
      <LandingMotion />
      <LandingHeader
        loginHref={loginHref}
        navItems={navItems}
        startFreeHref={startFreeHref}
      />

      <section
        className="relative -mt-[5.75rem] min-h-[52rem] scroll-mt-20 overflow-hidden px-4 pb-12 pt-40 sm:px-6 sm:pb-16 sm:pt-44 lg:min-h-[48rem] lg:px-8 lg:pt-40"
        id="demo"
      >
        <div className="hero-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute -right-40 top-24 h-[38rem] w-[38rem] rounded-full bg-emerald-200/65 blur-3xl" />
        <div className="absolute left-[42%] top-[12rem] h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-10">
            <span className="landing-reveal landing-delay-1 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/75 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-emerald-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <QrCode className="h-4 w-4" />
              Built for modern restaurants
            </span>

            <h1 className="landing-reveal landing-delay-2 mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.6rem]">
              Your menu,
              <span className="relative ml-3 inline-block text-emerald-600">
                reimagined.
                <svg className="absolute -bottom-2 left-0 h-3 w-full text-emerald-300" preserveAspectRatio="none" viewBox="0 0 200 12">
                  <path d="M2 9C50 2 137 2 198 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
                </svg>
              </span>
              <br />
              One scan away.
            </h1>
            <p className="landing-reveal landing-delay-3 mt-7 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
              Give every guest a beautiful, always-up-to-date menu. Manage
              products in seconds and share the whole experience with one QR code.
            </p>

            <div className="landing-reveal landing-delay-4 mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-slate-700">
              {[
                "No app required",
                "Khmer & English",
                "Real-time updates",
                "QR code ready",
              ].map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>

            <div className="landing-reveal landing-delay-5 mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={startFreeHref}>Start Free</PrimaryButton>
              <SecondaryButton href={sampleMenuHref}>View Live Demo</SecondaryButton>
            </div>
          </div>

          <div className="landing-reveal landing-delay-4 relative z-10">
            <div className="absolute -left-5 top-12 z-20 hidden rotate-[-8deg] rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-xl backdrop-blur sm:block">
              <p className="text-xs font-bold text-slate-500">Menu views today</p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                1,284 <span className="text-xs text-emerald-600">+18%</span>
              </p>
            </div>
            <LandingPhonePreview
              menuHref={sampleMenuHref}
              qrImageUrl={sampleQrCode.imageUrl}
              qrUrl={sampleQrCode.url}
            />
          </div>
        </div>

        <div className="landing-reveal landing-delay-6 relative z-20 mx-auto mt-12 grid w-full max-w-7xl gap-2 rounded-3xl border border-white/80 bg-white/75 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              className="flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors duration-200 hover:bg-white lg:border-r lg:border-slate-200/70 lg:last:border-r-0"
              key={label}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-black text-slate-950">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8"
        data-reveal
        id="features"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase text-emerald-600">
              Why KMRS?
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Everything you need to run your menu digitally
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, copy }, index) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-emerald-200"
                data-reveal
                key={title}
                style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}
              >
                <Icon className="h-9 w-9 text-emerald-600" />
                <h3 className="mt-5 text-lg font-black text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-24 bg-emerald-50/60 px-4 py-14 sm:px-6 lg:px-8"
        data-reveal
        id="dashboard"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">
              For Merchants
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Manage everything from one dashboard
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-7 text-slate-600">
              Powerful tools to manage your menu, products, QR codes, staff,
              and more.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm font-bold text-slate-700">
              {dashboardItems.slice(0, 6).map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-7">
              <PrimaryButton href={startFreeHref}>Start Free</PrimaryButton>
            </div>
          </div>

          <div data-reveal style={{ "--reveal-delay": "160ms" } as React.CSSProperties}>
            <LandingDashboardPreview />
          </div>
        </div>
      </section>

      <section
        className="relative scroll-mt-24 overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        data-reveal
        id="how-it-works"
      >
        <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 sm:text-sm">
              From setup to scan
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Live in five simple steps
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-6 text-slate-600 sm:text-base">
              No technical setup or app download. Create, publish, and start
              serving customers in minutes.
            </p>
          </div>

          <div className="relative mx-auto mt-9 max-w-xl lg:max-w-none">
            <div className="absolute bottom-10 left-[1.65rem] top-10 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent lg:hidden" />
            <div className="grid gap-3 lg:grid-cols-5 lg:gap-4">
            {flowSteps.map(({ icon: Icon, title, copy }, index) => (
              <article
                className="relative grid grid-cols-[3.4rem_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/85 p-4 text-left shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur transition-colors duration-200 hover:border-emerald-200 lg:block lg:min-h-56 lg:p-5 lg:text-center"
                data-reveal
                key={title}
                style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
              >
                <div className="relative z-10 grid h-13 w-13 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 lg:mx-auto lg:h-16 lg:w-16">
                  <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-[0.62rem] font-black text-white ring-2 ring-white">
                    {index + 1}
                  </span>
                </div>
                {index < flowSteps.length - 1 ? (
                  <div className="absolute left-[calc(50%+2.75rem)] top-[3.25rem] hidden h-px w-[calc(100%-5.5rem)] border-t border-dashed border-emerald-300 lg:block" />
                ) : null}
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-emerald-600 lg:mt-5">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-black text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm font-medium leading-5 text-slate-500 lg:mt-2">
                    {copy}
                  </p>
                </div>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-24 bg-slate-50/70 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        data-reveal
        id="pricing"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 sm:text-sm">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Start free. Grow when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Clear monthly pricing with no setup fees or long-term contracts.
            </p>
          </div>
          <div className="mx-auto mt-9 grid max-w-xl gap-4 lg:max-w-none lg:grid-cols-3 lg:items-stretch">
            {plans.map((plan, index) => (
              <article
                className={`relative flex flex-col overflow-hidden rounded-3xl border p-5 shadow-sm transition-colors duration-200 hover:border-emerald-300 sm:p-6 ${
                  plan.featured
                    ? "order-first border-emerald-400 bg-slate-950 text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)] lg:order-none lg:-translate-y-3"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
                data-reveal
                key={plan.name}
                style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}
              >
                {plan.featured ? (
                  <span className="absolute right-0 top-0 rounded-bl-2xl bg-emerald-400 px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-950">
                    Most popular
                  </span>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{plan.name}</h3>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        plan.featured ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Monthly plan
                    </p>
                  </div>
                </div>

                <p className="mt-6 flex items-end gap-1 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                  {plan.price}
                  <span
                    className={`mb-1 text-sm font-bold tracking-normal ${
                      plan.featured ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    {plan.price === "Free" ? "forever" : "/ month"}
                  </span>
                </p>
                <p
                  className={`mt-4 min-h-10 text-sm font-medium leading-5 ${
                    plan.featured ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {plan.description}
                </p>

                <div
                  className={`my-5 h-px ${
                    plan.featured ? "bg-white/10" : "bg-slate-200"
                  }`}
                />
                <div className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <p
                      className={`flex items-center gap-3 text-sm font-bold ${
                        plan.featured ? "text-white/80" : "text-slate-700"
                      }`}
                      key={feature}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                          plan.featured
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feature}
                    </p>
                  ))}
                </div>

                <Link
                  className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
                    plan.featured
                      ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                      : "bg-slate-950 text-white hover:bg-emerald-600"
                  }`}
                  href={startFreeHref}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            Cancel or change your plan anytime.
          </p>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8" data-reveal>
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-emerald-600" />
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Ready to go digital?
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Join local businesses using KMRS to grow their sales.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href={startFreeHref}>Start Free</PrimaryButton>
            <SecondaryButton href={sampleMenuHref}>View Demo</SecondaryButton>
          </div>
        </div>
      </section>

      <LandingFooter linkGroups={footerLinkGroups} />
    </main>
  );
}
