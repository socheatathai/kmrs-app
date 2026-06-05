import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Languages,
  MapPin,
  Phone,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_0.78fr] lg:px-10">
        <div className="relative z-10 rounded-lg border border-stone-200/80 bg-white/92 p-6 shadow-[0_30px_100px_rgba(43,38,30,0.14)] backdrop-blur sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Live customer web
            </span>
            <span className="rounded-full border border-stone-200 px-3 py-1 text-sm font-medium text-stone-600">
              KMRS public menu
            </span>
          </div>

          <p className="text-sm font-bold uppercase text-coral">
            Customer ordering surface
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] text-ink sm:text-5xl lg:text-6xl">
            Digital menus that open directly from each shop slug.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            Customers can browse products, categories, prices, and product
            details from a clean public route connected to the KMRS API.
          </p>

          <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)] transition hover:bg-stone-800"
              href="/sunrise-cafe"
            >
              <span>Open sample menu</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:border-stone-500"
              href="/sunrise-cafe/products/demo-product"
            >
              <span>Product route</span>
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <QrCode className="mb-4 h-5 w-5 text-emerald-700" />
              <p className="text-xs font-bold uppercase text-stone-500">
                Menu URL
              </p>
              <code className="mt-2 block break-all text-sm font-semibold text-ink">
                /&#123;slug&#125;
              </code>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <ShoppingBag className="mb-4 h-5 w-5 text-coral" />
              <p className="text-xs font-bold uppercase text-stone-500">
                Product URL
              </p>
              <code className="mt-2 block break-all text-sm font-semibold text-ink">
                /&#123;slug&#125;/products/&#123;id&#125;
              </code>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <Sparkles className="mb-4 h-5 w-5 text-teal-700" />
              <p className="text-xs font-bold uppercase text-stone-500">
                API origin
              </p>
              <code className="mt-2 block break-all text-sm font-semibold text-ink">
                BASE_URL
              </code>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_30%),linear-gradient(160deg,#0f172a_0%,#172554_44%,#1d4ed8_100%)] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.15rem] border border-white/20 bg-white/10 text-xl font-bold">
                    S
                  </div>
                  <div>
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase text-white/75">
                      <Sparkles className="h-3 w-3" />
                      Catalog ready
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      Sunrise Cafe
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Coffee, brunch, and bakery menu for demo data.
                    </p>
                  </div>
                </div>
                <div className="w-24 rounded-[1.1rem] border border-white/15 bg-white/10 p-2">
                  <p className="inline-flex items-center gap-1 text-[0.6rem] font-semibold uppercase text-white/65">
                    <Languages className="h-3 w-3" />
                    Lang
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <span className="rounded-lg bg-white px-2 py-1 text-center text-xs font-bold text-slate-900">
                      EN
                    </span>
                    <span className="rounded-lg bg-white/10 px-2 py-1 text-center text-xs font-bold text-white/85">
                      KM
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[0.9fr_1.1fr] gap-2 text-xs text-white/80">
                <div className="rounded-[1rem] border border-white/15 bg-white/10 p-3">
                  <p className="inline-flex items-center gap-1 uppercase text-white/60">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="mt-1 font-semibold text-white">+85512345678</p>
                </div>
                <div className="rounded-[1rem] border border-white/15 bg-white/10 p-3">
                  <p className="inline-flex items-center gap-1 uppercase text-white/60">
                    <MapPin className="h-3 w-3" />
                    Address
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    Phnom Penh, Cambodia
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-[1rem] border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/80">
                <QrCode className="h-4 w-4" />
                Menu
              </div>
            </div>

            <div className="bg-canvas p-4">
              <div className="rounded-[1.25rem] border border-slate-200/80 bg-white/90 p-3 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <div className="h-11 rounded-[1rem] border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm leading-[2.75rem] text-slate-400">
                    Search products
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden">
                  {["All items", "Coffee", "Brunch"].map((category, index) => (
                    <span
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                        index === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Coffee", "Americano", "$2.50", "#431"],
                  ["Brunch", "Avocado Toast", "$5.75", "#1080"],
                ].map(([category, name, price, image]) => (
                  <div
                    className="overflow-hidden rounded-[1.35rem] border border-white bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                    key={name}
                  >
                    <div className="h-28 bg-[linear-gradient(140deg,#fecaca,#fed7aa)]">
                      <div className="flex h-full items-end p-3 text-xs font-semibold uppercase text-white/90">
                        {image}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase text-coral">
                            {category}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-slate-950">
                            {name}
                          </h3>
                        </div>
                        <p className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                          {price}
                        </p>
                      </div>
                      <p className="mt-3 text-xs font-semibold text-slate-900">
                        View details
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
