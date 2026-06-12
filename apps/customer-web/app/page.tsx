import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Cloud,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Menu,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Utensils,
  Zap,
} from "lucide-react";

import { getPublicQrCode } from "@/lib/api";

const sampleShopSlug = "sunrise-cafe";
const sampleMenuHref = `/${sampleShopSlug}`;
const merchantHref =
  process.env.NEXT_PUBLIC_MERCHANT_CMS_URL ?? "http://localhost:3001";

const navItems = ["Features", "Pricing", "Demo", "Documentation"];

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

const phoneProducts = [
  {
    category: "Coffee",
    name: "Americano",
    price: "$2.50",
    copy: "Double espresso with hot water.",
    imageUrl: "https://picsum.photos/id/431/240/240",
  },
  {
    category: "Brunch",
    name: "Avocado Toast",
    price: "$5.75",
    copy: "Sourdough, avocado, poached egg.",
    imageUrl: "https://picsum.photos/id/1080/240/240",
  },
  {
    category: "Bakery",
    name: "Butter Croissant",
    price: "$2.25",
    copy: "Flaky pastry baked fresh daily.",
    imageUrl: "https://picsum.photos/id/102/240/240",
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

function LogoMark() {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
      <QrCode className="h-6 w-6" />
    </span>
  );
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

function PhonePreview({
  qrImageUrl,
  qrUrl,
}: {
  qrImageUrl: string;
  qrUrl: string;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[34rem] items-center gap-4 sm:grid-cols-[10.5rem_minmax(0,22rem)] lg:max-w-[38rem] lg:grid-cols-[11.5rem_minmax(0,23rem)]">
      <Link
        className="order-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:border-emerald-300 sm:order-1"
        href={sampleMenuHref}
      >
        <p className="text-center text-xs font-black text-slate-950">
          Sunrise Cafe
        </p>
        <p className="mt-1 text-center text-[0.65rem] font-semibold text-slate-500">
          Scan to view menu
        </p>
        <div className="mt-3 rounded-xl border border-slate-100 bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Sunrise Cafe menu QR code"
            className="aspect-square w-full object-contain"
            src={qrImageUrl}
          />
        </div>
        <p className="mt-3 break-all text-center text-[0.62rem] font-bold leading-4 text-slate-500">
          {qrUrl}
        </p>
      </Link>

      <div className="relative order-1 mx-auto w-full max-w-[22rem] overflow-hidden rounded-[2.4rem] border-[0.55rem] border-slate-950 bg-white shadow-[0_36px_90px_rgba(15,23,42,0.22)] sm:order-2">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-950" />
        <div className="min-h-[33rem] bg-[#FAFAF9] p-4 pt-8 sm:min-h-[34rem]">
          <div className="flex items-center justify-between text-[0.7rem] font-black text-slate-950">
            <span>9:41</span>
            <span className="h-2 w-12 rounded-full bg-slate-900/80" />
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-orange-50 text-center text-[0.58rem] font-black text-slate-950 ring-1 ring-orange-100">
                SUNRISE
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Sunrise Cafe
                </h3>
                <p className="mt-1 text-[0.7rem] font-semibold text-slate-500">
                  Coffee, brunch, and bakery
                </p>
              </div>
            </div>
            <div className="flex gap-1 rounded-lg border border-emerald-100 bg-white p-1 text-[0.65rem] font-black">
              <span className="rounded-md bg-emerald-600 px-2 py-1 text-white">
                EN
              </span>
              <span className="px-2 py-1 text-slate-500">KM</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400">
              Search products
            </span>
            <QrCode className="ml-auto h-4 w-4 text-emerald-600" />
          </div>

          <div className="mt-4 flex gap-2 overflow-hidden">
            {["All items", "Coffee", "Brunch", "Bakery"].map(
              (category, index) => (
                <span
                  className={`shrink-0 rounded-full px-3 py-2 text-[0.65rem] font-black ${
                    index === 0
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                  key={category}
                >
                  {category}
                </span>
              ),
            )}
          </div>

          <div className="mt-5 space-y-2.5">
            {phoneProducts.map(({ category, name, price, copy, imageUrl }) => (
              <div
                className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                key={name}
              >
                <div className="relative h-[4.75rem] overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${name} menu item`}
                    className="h-full w-full object-cover"
                    src={imageUrl}
                  />
                </div>
                <div className="min-w-0 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[0.56rem] font-black uppercase tracking-wide text-emerald-600">
                        {category}
                      </p>
                      <p className="mt-1 truncate text-[0.95rem] font-black leading-5 text-slate-950">
                        {name}
                      </p>
                    </div>
                    <p className="shrink-0 rounded-full bg-slate-950 px-2 py-1 text-[0.68rem] font-black text-white">
                      {price}
                    </p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[0.68rem] font-semibold leading-4 text-slate-500">
                    {copy}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[0.58rem] font-black text-emerald-700">
                      Available
                    </span>
                    <span className="text-[0.62rem] font-black text-slate-400">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
            <div>
              <p className="text-xs font-black">View cart</p>
              <p className="mt-0.5 text-[0.65rem] font-semibold text-white/60">
                2 selected items
              </p>
            </div>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-xs font-black">
              2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const sampleQrCode = await getSampleQrCode();

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#FAFAF9]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <LogoMark />
            <span className="text-xl font-black tracking-[-0.01em] text-slate-950">
              KMRS
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-slate-700 lg:flex">
            {navItems.map((item) => (
              <a className="transition hover:text-emerald-600" href="#" key={item}>
                {item}
              </a>
            ))}
            <a className="inline-flex items-center gap-1" href="#">
              Resources
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-black text-slate-800 transition hover:bg-slate-100"
              href={merchantHref}
            >
              Login
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
              href={merchantHref}
            >
              Start Free
            </Link>
          </div>

          <button
            aria-label="Open navigation"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-950 sm:hidden"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
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
              <PrimaryButton href={merchantHref}>Start Free</PrimaryButton>
              <SecondaryButton href={sampleMenuHref}>View Live Demo</SecondaryButton>
            </div>
          </div>

          <div className="relative z-10">
            <PhonePreview
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

      <section className="px-4 py-12 sm:px-6 lg:px-8" id="features">
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

      <section className="bg-emerald-50/60 px-4 py-14 sm:px-6 lg:px-8">
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
              <PrimaryButton href={merchantHref}>Start Free</PrimaryButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#05070b] shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
            <div className="grid min-h-[28rem] grid-cols-[4.75rem_1fr] sm:grid-cols-[13rem_1fr]">
              <aside className="flex flex-col border-r border-slate-800 bg-[#07090d] p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/20 text-lg font-black text-emerald-400">
                    K
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-base font-black text-white">KMRS</p>
                    <p className="text-xs font-semibold text-slate-400">
                      Merchant CMS
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <p className="hidden px-2 text-[0.65rem] font-black uppercase tracking-widest text-slate-500 sm:block">
                    Workspace
                  </p>
                  <div className="rounded-lg border-l-4 border-emerald-400 bg-emerald-500/15 px-2 py-3 text-center text-sm font-black text-emerald-400 sm:text-left">
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">D</span>
                  </div>
                  <p className="hidden px-2 pt-4 text-[0.65rem] font-black uppercase tracking-widest text-slate-500 sm:block">
                    Merchant
                  </p>
                  {["Shops", "Description", "Catalog", "QR Codes"].map(
                    (item) => (
                      <div
                        className="rounded-lg px-2 py-2 text-center text-xs font-black text-slate-400 sm:text-left"
                        key={item}
                      >
                        <span className="hidden sm:inline">{item}</span>
                        <span className="sm:hidden">{item.slice(0, 1)}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-auto hidden border-t border-slate-800 pt-4 sm:block">
                  <p className="text-sm font-black text-white">Nika Demo</p>
                  <p className="text-xs font-semibold text-slate-400">
                    nika@example.com
                  </p>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="border-b border-slate-800 px-4 py-4">
                  <h3 className="text-xl font-black text-white">Dashboard</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    Sunrise Cafe
                  </p>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      ["Accessible shops", "1"],
                      ["Active shops", "1"],
                      ["Permissions", "26"],
                    ].map(([label, value]) => (
                      <div
                        className="rounded-lg border border-slate-800 bg-white/[0.03] p-4"
                        key={label}
                      >
                        <p className="text-sm font-semibold text-slate-400">
                          {label}
                        </p>
                        <p className="mt-4 text-3xl font-black text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-white/[0.03] p-4">
                    <div>
                      <p className="font-black text-white">
                        Current Subscription
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        Starter - ACTIVE
                      </p>
                    </div>
                    <span className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-black text-white">
                      Manage
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-white">Shops</p>
                        <p className="mt-1 text-sm font-semibold text-slate-400">
                          Live data from the /shops API.
                        </p>
                      </div>
                      <span className="w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm font-black text-white">
                        Open shops
                      </span>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-lg border border-slate-800">
                      <div className="hidden grid-cols-4 bg-[#0b0d12] px-4 py-3 text-[0.65rem] font-black uppercase tracking-widest text-slate-400 sm:grid">
                        <span>Name</span>
                        <span>Slug</span>
                        <span>Status</span>
                        <span>Open</span>
                      </div>
                      <div className="grid gap-3 bg-white/[0.03] px-4 py-4 text-sm font-black text-white sm:grid-cols-4 sm:items-center">
                        <span>Sunrise Cafe</span>
                        <span className="text-slate-300">sunrise-cafe</span>
                        <span className="w-fit rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                          Active
                        </span>
                        <span className="text-emerald-400">Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
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

      <section className="px-4 py-14 sm:px-6 lg:px-8" id="pricing">
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
            <PrimaryButton href={merchantHref}>Start Free</PrimaryButton>
            <SecondaryButton href={sampleMenuHref}>View Demo</SecondaryButton>
          </div>
        </div>
      </section>

      <footer className="bg-[#0F172A] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link className="flex items-center gap-3" href="/">
              <LogoMark />
              <span className="text-xl font-black">KMRS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-slate-300">
              Digital menu platform for local businesses.
            </p>
          </div>

          {[
            ["Product", "Features", "Pricing"],
            ["Resources", "Docs", "Support"],
            ["Company", "Contact", "About"],
          ].map(([heading, ...links]) => (
            <div key={heading}>
              <h3 className="text-sm font-black">{heading}</h3>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
                {links.map((item) => (
                  <a className="transition hover:text-white" href="#" key={item}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
