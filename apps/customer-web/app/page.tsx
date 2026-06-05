import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink sm:px-6 sm:py-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8 md:grid-cols-[1.15fr_0.85fr] md:p-12">
        <div className="flex flex-col justify-center gap-8">
          <div className="space-y-4">
            <p className="text-sm font-bold uppercase text-coral">
              Welcome to KMRS
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold text-ink sm:text-5xl md:text-6xl">
              Explore the Sunrise Cafe menu.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              Take a quick look at a live demo menu with coffee, bakery, and
              brunch items. Open the menu and browse it like a customer.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-start">
            <Link
              className="inline-flex min-h-14 min-w-60 items-center justify-center gap-3 rounded-full border-2 border-coral bg-white px-8 py-4 text-base font-bold text-coral shadow-[0_14px_34px_rgba(234,88,12,0.18)] transition hover:bg-orange-50"
              href="/sunrise-cafe"
              style={{ color: "#ea580c" }}
            >
              See demo menu
              <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
            <p className="text-sm text-slate-500">
              Opens the sample shop at <code>/sunrise-cafe</code>.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,#164e63,#2563eb)] p-6 text-white md:p-8">
          <p className="text-sm font-bold uppercase text-white/70">
            What you will see
          </p>
          <p className="mt-4 text-2xl font-semibold">
            A simple cafe menu experience
          </p>
          <p className="mt-4 text-sm leading-7 text-white/85">
            The demo shows how customers can browse categories, view items, and
            open product details in a clean public storefront.
          </p>
          <div className="mt-6 rounded-[1.25rem] border border-white/15 bg-white/10 p-4 text-sm text-white/90">
            Demo shop: <code>Sunrise Cafe</code>
            <br />
            Route: <code>/sunrise-cafe</code>
          </div>
        </div>
      </section>
    </main>
  );
}
