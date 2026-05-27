export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="h-28 animate-pulse rounded-[1.8rem] bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-[1.8rem] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
