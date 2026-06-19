import Link from "next/link";
import { QrCode, Search } from "lucide-react";

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

type LandingPhonePreviewProps = {
  menuHref: string;
  qrImageUrl: string;
  qrUrl: string;
};

export function LandingPhonePreview({
  menuHref,
  qrImageUrl,
  qrUrl,
}: LandingPhonePreviewProps) {
  return (
    <div className="mx-auto grid w-full max-w-[34rem] items-center gap-4 sm:grid-cols-[10.5rem_minmax(0,22rem)] lg:max-w-[38rem] lg:grid-cols-[11.5rem_minmax(0,23rem)]">
      <Link
        className="order-2 animate-[gentle-float_6s_ease-in-out_infinite] rounded-3xl border border-white/90 bg-white/90 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur transition hover:-translate-y-1 hover:border-emerald-300 sm:order-1"
        href={menuHref}
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

      <div className="relative order-1 mx-auto w-full max-w-[22rem] animate-[phone-float_7s_ease-in-out_infinite] overflow-hidden rounded-[2.7rem] border-[0.55rem] border-slate-950 bg-white shadow-[0_36px_90px_rgba(15,23,42,0.22)] sm:order-2">
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
        </div>
      </div>
    </div>
  );
}
