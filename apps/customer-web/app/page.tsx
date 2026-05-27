import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10 text-ink">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-coral">
            KMRS customer web
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink md:text-6xl">
            Public menu routes are ready for real shop slugs.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            Open a shop menu at{" "}
            <code className="rounded bg-slate-100 px-2 py-1">/{`{slug}`}</code>{" "}
            or a product detail at{" "}
            <code className="rounded bg-slate-100 px-2 py-1">
              /{`{slug}`}/products/{`{productId}`}
            </code>
            .
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Local setup
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Set <code>BASE_URL</code> to the core API origin, for example{" "}
              <code>http://localhost:3333</code>. The menu page will call the
              public endpoints under <code>/menu</code>.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,#0f172a,#1d4ed8)] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">
              Example
            </p>
            <p className="mt-3 text-sm leading-7 text-white/90">
              If your shop slug is <code>sunrise-cafe</code>, open{" "}
              <Link
                className="underline decoration-white/40 underline-offset-4"
                href="/sunrise-cafe"
              >
                /sunrise-cafe
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
