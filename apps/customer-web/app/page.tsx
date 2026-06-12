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
import { LandingPhonePreview } from "@/components/landing/landing-phone-preview";
import { getPublicQrCode } from "@/lib/api";

const sampleShopSlug = "sunrise-cafe";
const sampleMenuHref = `/${sampleShopSlug}`;

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "#demo" },
  { label: "Documentation", href: "#documentation" },
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
      { label: "Docs", href: "#documentation" },
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
    features: ["1 Shop", "20 Products"],
  },
  {
    name: "Pro",
    price: "$10",
    featured: true,
    features: ["Unlimited Products", "Staff Management"],
  },
  {
    name: "Business",
    price: "$20",
    features: ["Multi Shop", "Advanced Features"],
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_18px_38px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:px-6"
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 sm:px-6"
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
    <main className="min-h-screen bg-[#FAFAF9] text-[#111827]">
      <LandingHeader
        loginHref={loginHref}
        navItems={navItems}
        resourcesHref="#resources"
        startFreeHref={startFreeHref}
      />

      <section
        className="relative scroll-mt-20 overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8"
        id="demo"
      >
        <div className="absolute right-0 top-24 h-[34rem] w-[34rem] rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1fr]">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase text-emerald-700">
              <QrCode className="h-4 w-4" />
              QR Menu Platform
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Turn your menu into a QR-powered{" "}
              <span className="text-emerald-600">digital experience</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
              Create digital menus, manage products, and let customers scan QR
              codes to order instantly.
            </p>

            <div className="mt-6 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={startFreeHref}>Start Free</PrimaryButton>
              <SecondaryButton href={sampleMenuHref}>View Live Demo</SecondaryButton>
            </div>
          </div>

          <div className="relative z-10">
            <LandingPhonePreview
              menuHref={sampleMenuHref}
              qrImageUrl={sampleQrCode.imageUrl}
              qrUrl={sampleQrCode.url}
            />
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-10 grid w-full max-w-7xl gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-[0_22px_70px_rgba(15,23,42,0.08)] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              className="flex items-center gap-4 rounded-lg px-3 py-4 lg:border-r lg:border-slate-200 lg:last:border-r-0"
              key={label}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Icon className="h-6 w-6" />
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
        className="scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
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
            {features.map(({ icon: Icon, title, copy }) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                key={title}
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
        className="scroll-mt-20 bg-emerald-50/60 px-4 py-14 sm:px-6 lg:px-8"
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

          <LandingDashboardPreview />
        </div>
      </section>

      <section
        className="scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
        id="documentation"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-black text-slate-950 sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-5">
            {flowSteps.map(({ icon: Icon, title, copy }, index) => (
              <div className="relative text-center" key={title}>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Icon className="h-8 w-8" />
                </div>
                {index < flowSteps.length - 1 ? (
                  <div className="absolute left-[calc(50%+2.75rem)] top-8 hidden h-px w-[calc(100%-5.5rem)] border-t border-dashed border-slate-300 lg:block" />
                ) : null}
                <p className="mt-4 text-xs font-black text-emerald-600">
                  {index + 1}
                </p>
                <h3 className="mt-1 text-sm font-black text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8"
        id="pricing"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase text-emerald-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Simple plans for growing restaurants
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                className={`rounded-lg border p-6 shadow-sm ${
                  plan.featured
                    ? "border-emerald-500 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
                key={plan.name}
              >
                <h3 className="text-xl font-black">{plan.name}</h3>
                <p className="mt-4 text-4xl font-black">
                  {plan.price}
                  <span
                    className={`text-sm font-bold ${
                      plan.featured ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    /month
                  </span>
                </p>
                <div className="my-6 h-px bg-slate-200/70" />
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <p
                      className={`flex items-center gap-2 text-sm font-bold ${
                        plan.featured ? "text-white/80" : "text-slate-700"
                      }`}
                      key={feature}
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
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
