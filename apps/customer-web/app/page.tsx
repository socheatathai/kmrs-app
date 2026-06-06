import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Languages,
  MapPin,
  Phone,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { getPublicProducts } from "@/lib/api";

const sampleShopSlug = "sunrise-cafe";
const sampleMenuHref = `/${sampleShopSlug}`;

async function getSampleProductHref() {
  try {
    const products = await getPublicProducts(sampleShopSlug);
    const product = products[0];

    if (product) {
      return `/${sampleShopSlug}/products/${product.id}`;
    }
  } catch {
    return sampleMenuHref;
  }

  return sampleMenuHref;
}

export default async function Home() {
  const sampleProductHref = await getSampleProductHref();

  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      <section className="mx-auto grid min-h-[100svh] w-full max-w-7xl items-center gap-7 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[0.92fr_0.72fr] lg:grid-rows-[auto_auto] lg:gap-x-14 lg:gap-y-8 lg:px-10">
        <div className="relative z-10 lg:col-start-1 lg:row-start-1">
          <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:mb-7 sm:gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Live customer web
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 shadow-sm">
              <QrCode className="h-4 w-4 text-coral" />
              QR-ready menu
            </span>
          </div>

          <p className="text-sm font-black uppercase tracking-[0.14em] text-coral">
            Customer ordering surface
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.04] text-ink sm:mt-4 sm:text-6xl lg:text-7xl">
            Digital menus customers can read fast.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-xl sm:leading-8">
            Open a polished public menu from any shop slug. Products,
            categories, prices, and details stay connected to the KMRS API.
          </p>

          <div className="mt-7 flex max-w-xl flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-[3.15rem] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-ink px-5 py-3 text-base font-black text-white shadow-[0_18px_38px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:min-h-[3.25rem] sm:px-6 sm:py-3.5"
              href={sampleMenuHref}
            >
              <span>Open sample menu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-[3.15rem] items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-black text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-slate-500 sm:min-h-[3.25rem] sm:px-6 sm:py-3.5"
              href={sampleProductHref}
            >
              <span>Product route</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[25.5rem] sm:max-w-[28rem] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="relative overflow-hidden rounded-[1.25rem] border border-white bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:rounded-[1.75rem] sm:shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
            <div className="bg-[linear-gradient(150deg,#111827_0%,#123c69_52%,#0f766e_100%)] p-4 text-white sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/[0.12] text-lg font-black shadow-inner sm:h-14 sm:w-14 sm:text-xl">
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.12] px-2.5 py-1 text-[0.65rem] font-black uppercase text-white/80">
                      <Sparkles className="h-3 w-3" />
                      Catalog ready
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                      Sunrise Cafe
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Coffee, brunch, and bakery menu for demo data.
                    </p>
                  </div>
                </div>
                <div className="w-20 shrink-0 rounded-lg border border-white/15 bg-white/[0.12] p-2 sm:w-24">
                  <p className="inline-flex items-center gap-1 text-[0.6rem] font-black uppercase text-white/70">
                    <Languages className="h-3 w-3" />
                    Lang
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <span className="rounded-md bg-white px-2 py-1 text-center text-xs font-black text-slate-900">
                      EN
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-center text-xs font-black text-white/85">
                      KM
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-white/80 sm:mt-5 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-lg border border-white/15 bg-white/[0.12] p-3">
                  <p className="inline-flex items-center gap-1 uppercase text-white/60">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="mt-1 font-semibold text-white">+85512345678</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/[0.12] p-3">
                  <p className="inline-flex items-center gap-1 uppercase text-white/60">
                    <MapPin className="h-3 w-3" />
                    Address
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    Phnom Penh, Cambodia
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.12] px-3 py-2 text-xs font-semibold text-white/85">
                <QrCode className="h-4 w-4" />
                Menu
              </div>
            </div>

            <div className="bg-[#f2f5ef] p-3 sm:p-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <div className="h-11 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm leading-[2.75rem] text-slate-500">
                    Search products
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden">
                  {["All items", "Coffee", "Brunch"].map((category, index) => (
                    <span
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                        index === 0
                          ? "bg-ink text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                {[
                  [
                    "Coffee",
                    "Americano",
                    "$2.50",
                    "#431",
                    "bg-gradient-to-br from-amber-200 to-orange-300",
                  ],
                  [
                    "Brunch",
                    "Avocado Toast",
                    "$5.75",
                    "#1080",
                    "bg-gradient-to-br from-lime-200 to-emerald-300",
                  ],
                ].map(([category, name, price, image, tone]) => (
                  <div
                    className="overflow-hidden rounded-lg border border-white bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
                    key={name}
                  >
                    <div className={`h-20 sm:h-28 ${tone}`}>
                      <div className="flex h-full items-end p-3 text-xs font-semibold uppercase text-white/90">
                        {image}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex min-h-[4.7rem] flex-col justify-between gap-2 sm:min-h-0 sm:flex-row sm:items-start sm:gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.65rem] font-black uppercase text-coral">
                            {category}
                          </p>
                          <h3 className="mt-1 text-sm font-black leading-5 text-slate-950 sm:text-base">
                            {name}
                          </h3>
                        </div>
                        <p className="w-fit rounded-full bg-ink px-2.5 py-1 text-xs font-black text-white">
                          {price}
                        </p>
                      </div>
                      <p className="mt-3 text-xs font-black text-slate-900">
                        View details
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:col-start-1 lg:row-start-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <QrCode className="mb-5 h-5 w-5 text-emerald-700" />
            <p className="text-xs font-black uppercase text-slate-500">
              Menu URL
            </p>
            <code className="mt-2 block break-all text-sm font-semibold text-ink">
              /&#123;slug&#125;
            </code>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <ShoppingBag className="mb-5 h-5 w-5 text-coral" />
            <p className="text-xs font-black uppercase text-slate-500">
              Product URL
            </p>
            <code className="mt-2 block break-all text-sm font-semibold text-ink">
              /&#123;slug&#125;/products/&#123;id&#125;
            </code>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <Sparkles className="mb-5 h-5 w-5 text-teal-700" />
            <p className="text-xs font-black uppercase text-slate-500">
              API origin
            </p>
            <code className="mt-2 block break-all text-sm font-semibold text-ink">
              BASE_URL
            </code>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/80 px-4 py-6 backdrop-blur sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-ink">KMRS Customer Web</p>
            <p className="mt-1">Public menu routes for active shops.</p>
          </div>

          <nav className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
              href={sampleMenuHref}
            >
              <QrCode className="h-4 w-4 text-emerald-700" />
              Sample menu
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
              href={sampleProductHref}
            >
              <ShoppingBag className="h-4 w-4 text-coral" />
              Product
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
