import Image from "next/image";

const dashboardNavItems = ["Shops", "Description", "Catalog", "QR Codes"];
const dashboardMetrics = [
  ["Accessible shops", "1"],
  ["Active shops", "1"],
  ["Permissions", "26"],
];

export function LandingDashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#05070b] shadow-[0_28px_80px_rgba(15,23,42,0.26)]">
      <div className="grid min-h-[28rem] grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[13rem_1fr]">
        <aside className="flex flex-col border-r border-slate-800 bg-[#07090d] p-3">
          <div className="flex items-center gap-3">
            <Image
              alt="KMRS App"
              className="h-10 w-10 rounded-lg object-cover ring-1 ring-amber-400/30"
              height={640}
              src="/logo.png"
              width={640}
            />
            <div className="hidden sm:block">
              <p className="text-base font-black text-white">KMRS App</p>
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
            {dashboardNavItems.map((item) => (
              <div
                className="rounded-lg px-2 py-2 text-center text-xs font-black text-slate-400 sm:text-left"
                key={item}
              >
                <span className="hidden sm:inline">{item}</span>
                <span className="sm:hidden">{item.slice(0, 1)}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto hidden border-t border-slate-800 pt-4 sm:block">
            <p className="text-sm font-black text-white">Nika Demo</p>
            <p className="text-xs font-semibold text-slate-400">
              nika@example.com
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="border-b border-slate-800 px-5 py-5 sm:px-4 sm:py-4">
            <h3 className="text-2xl font-black text-white sm:text-xl">
              Dashboard
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Sunrise Cafe
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-4">
            <div className="grid gap-4 md:grid-cols-3">
              {dashboardMetrics.map(([label, value]) => (
                <div
                  className="rounded-lg border border-[#1f2e44] bg-white/[0.03] p-5 sm:border-slate-800 sm:p-4"
                  key={label}
                >
                  <p className="text-sm font-bold text-slate-300 sm:font-semibold sm:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-6 text-4xl font-black text-white sm:mt-4 sm:text-3xl">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-[#1f2e44] bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between sm:border-slate-800 sm:p-4">
              <div>
                <p className="text-lg font-black text-white sm:text-base">
                  Current Subscription
                </p>
                <p className="mt-1 text-base font-semibold text-slate-400 sm:text-sm">
                  Starter - ACTIVE
                </p>
              </div>
              <span className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-black text-white sm:min-h-0 sm:w-auto">
                Manage
              </span>
            </div>

            <div className="rounded-lg border border-[#1f2e44] bg-white/[0.03] p-5 sm:border-slate-800 sm:p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-black text-white sm:text-base">
                    Shops
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-400 sm:text-sm">
                    Live data from the /shops API.
                  </p>
                </div>
                <span className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-black text-white sm:min-h-0 sm:w-fit">
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
  );
}
