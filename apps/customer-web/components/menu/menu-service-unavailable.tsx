import { Home, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

type MenuServiceUnavailableProps = {
  retryHref: string;
};

export function MenuServiceUnavailable({
  retryHref,
}: MenuServiceUnavailableProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-canvas px-4 py-10 text-ink sm:px-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-coral/10 blur-3xl" />

      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/85 p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <WifiOff className="h-8 w-8" />
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
          Temporarily unavailable
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
          We couldn&apos;t load this menu.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-slate-600 sm:text-base">
          The service may be restarting or your connection may be unstable.
          Please wait a moment and try again.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
            href={retryHref}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300"
            href="/"
          >
            <Home className="h-4 w-4" />
            Go to home
          </Link>
        </div>

        <p className="mt-5 text-xs font-semibold text-slate-400">
          Your device and account are safe. No action is required.
        </p>
      </section>
    </main>
  );
}
