import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-4 py-10 text-ink sm:px-8">
      <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-[-8rem] h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />

      <section className="relative w-full max-w-3xl">
        <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-[0_16px_34px_rgba(15,23,42,0.22)]">
          <SearchX className="h-7 w-7" />
        </div>

        <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">
          404 page not found
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-ink sm:text-6xl">
          This menu link does not exist.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          The page may have moved, or the shop URL was typed incorrectly. Go
          back to the KMRS landing page and choose a valid menu route.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 font-black text-white shadow-[0_18px_38px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800"
            href="/"
          >
            <Home className="h-4 w-4" />
            Back to landing page
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-5 py-3 font-black text-ink shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-white"
            href="/sunrise-cafe"
          >
            <ArrowLeft className="h-4 w-4" />
            Open sample menu
          </Link>
        </div>
      </section>
    </main>
  );
}
