"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Phone, QrCode, ShoppingBag, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Product, Shop } from "@/lib/api";
import { getMessage } from "@/lib/i18n";
import { useMenuStore } from "@/lib/store/menu-store";

export function ProductDetailShell({
  product,
  shop,
}: {
  product: Product;
  shop: Shop;
}) {
  const locale = useMenuStore((state) => state.locale);
  const copy = getMessage(locale);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition hover:border-emerald-400 hover:text-emerald-700"
            href={`/${shop.slug}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.backToMenu}
          </Link>

          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-lg border border-white bg-white shadow-[0_14px_44px_rgba(15,23,42,0.08)] md:rounded-[1.75rem] md:shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="relative h-64 overflow-hidden bg-[linear-gradient(140deg,#f7efd8,#e2c470)] md:h-[26rem]">
              {product.imageUrl ? (
                <Image
                  alt={product.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 768px) 80vw, 100vw"
                  src={product.imageUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#d4a83f,transparent_45%),linear-gradient(160deg,#14212d,#70491d)] px-6 text-center text-3xl font-semibold text-white md:text-5xl">
                  {product.name}
                </div>
              )}
            </div>

            <div className="grid gap-6 p-4 md:grid-cols-[1.35fr_0.65fr] md:gap-8 md:p-6">
              <div className="space-y-4 md:space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-coral">
                      <Tag className="h-3.5 w-3.5" />
                      {product.category?.name ?? copy.products}
                    </p>
                    <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950 md:mt-2 md:text-5xl">
                      {product.name}
                    </h1>
                  </div>
                  <p className="shrink-0 rounded-full bg-slate-950 px-4 py-1.5 text-base font-semibold text-white md:text-lg">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <p className="text-base leading-8 text-slate-700 md:text-lg">
                  {product.description || copy.descriptionFallback}
                </p>
              </div>

              <aside className="flex flex-col gap-4 rounded-lg border border-emerald-100 bg-emerald-50/45 p-4 md:rounded-[1.1rem] md:p-5">
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">
                    {shop.name}
                  </p>
                  {shop.description ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {shop.description}
                    </p>
                  ) : null}
                </div>

                {shop.phone ? (
                  <div className="inline-flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                    <Phone className="h-4 w-4 text-coral" />
                    {shop.phone}
                  </div>
                ) : null}

                {shop.address ? (
                  <div className="inline-flex items-start gap-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 text-coral" />
                    <span>{shop.address}</span>
                  </div>
                ) : null}
              </aside>
            </div>
          </motion.article>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/80 px-5 py-6 backdrop-blur md:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-ink">{shop.name}</p>
            <p className="mt-1">Product detail route for this public menu.</p>
          </div>

          <nav className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
              href={`/${shop.slug}`}
            >
              <QrCode className="h-4 w-4 text-emerald-700" />
              {copy.backToMenu}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
              href={`/${shop.slug}/products/${product.id}`}
            >
              <ShoppingBag className="h-4 w-4 text-coral" />
              {product.name}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
