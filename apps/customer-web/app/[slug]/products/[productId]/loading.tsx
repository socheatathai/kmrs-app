export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="h-[38rem] animate-pulse rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]" />
      </div>
    </main>
  );
}
