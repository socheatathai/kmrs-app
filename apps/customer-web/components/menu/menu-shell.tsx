"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  MapPin,
  Phone,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import {
  groupProductsByCategory,
  trackQrScan,
  type Category,
  type Product,
  type Shop,
} from "@/lib/api";
import { getMessage } from "@/lib/i18n";
import { useMenuStore } from "@/lib/store/menu-store";

type MenuShellProps = {
  categories: Category[];
  products: Product[];
  shop: Shop;
};

const cardMotion: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function MenuShell({ categories, products, shop }: MenuShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, activeCategory, setActiveCategory, setLocale } =
    useMenuStore();
  const copy = getMessage(locale);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const groupedProducts = useMemo(
    () => groupProductsByCategory(categories, products),
    [categories, products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return groupedProducts.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category?.id === activeCategory;
      const haystack = [
        product.name,
        product.description ?? "",
        product.category?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, deferredQuery, groupedProducts]);

  const qrScanMutation = useMutation({
    mutationFn: () => trackQrScan(shop.slug),
  });

  const trackScan = useEffectEvent(() => {
    if (searchParams.get("source") !== "qr") {
      return;
    }

    if (qrScanMutation.isPending || qrScanMutation.isSuccess) {
      return;
    }

    qrScanMutation.mutate();
  });

  useEffect(() => {
    trackScan();
  }, []);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="relative overflow-hidden border-b border-[#efe8dc] bg-[#14233d] px-4 pb-5 pt-4 text-white md:px-8 md:pb-10 md:pt-8">
        {shop.coverUrl ? (
          <Image
            alt=""
            className="object-cover opacity-20"
            fill
            priority
            sizes="100vw"
            src={shop.coverUrl}
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,35,61,0.94)_0%,rgba(29,67,96,0.94)_56%,rgba(17,124,112,0.96)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-7">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#4a586f]/90 px-3 py-2 text-[0.68rem] font-black uppercase text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:px-4 md:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.catalogReady}
            </p>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-[#4a5669]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur">
              {(["en", "km"] as const).map((option) => (
                <button
                  key={option}
                  className={`h-9 min-w-10 rounded-full px-3 text-sm font-black transition ${
                    locale === option
                      ? "bg-white text-slate-900"
                      : "text-white/70"
                  }`}
                  onClick={() => {
                    startTransition(() => {
                      setLocale(option);
                    });
                  }}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-white/10 md:h-20 md:w-20">
              {shop.logoUrl ? (
                <Image
                  alt={shop.name}
                  className="object-cover"
                  fill
                  sizes="(min-width: 768px) 80px, 64px"
                  src={shop.logoUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/10 text-2xl font-semibold">
                  {shop.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-tight text-white md:text-6xl">
                {shop.name}
              </h1>
              {shop.description ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/90 md:mt-3 md:text-base md:leading-7">
                  {shop.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-white/90 md:grid-cols-3 md:gap-3">
            {shop.phone ? (
              <div className="rounded-lg border border-[#6d91a3]/70 bg-[#376b83]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur md:p-4">
                <p className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase text-[#c3d0db] md:text-xs">
                  <Phone className="h-3.5 w-3.5" />
                  {copy.phone}
                </p>
                <p className="mt-2 font-semibold text-white">{shop.phone}</p>
              </div>
            ) : null}
            {shop.address ? (
              <div className="rounded-lg border border-[#6d91a3]/70 bg-[#376b83]/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur md:col-span-2 md:p-4">
                <p className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase text-[#c3d0db] md:text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  {copy.address}
                </p>
                <p className="mt-2 font-semibold text-white">{shop.address}</p>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-11 items-center gap-3 rounded-lg border border-[#65a69f]/70 bg-[#2f817c]/85 px-3 py-2.5 text-sm font-bold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur md:px-4 md:py-3">
            <QrCode className="h-4 w-4" />
            {searchParams.get("source") === "qr" ? (
              <span>
                {qrScanMutation.isSuccess
                  ? copy.qrTracked
                  : qrScanMutation.isError
                    ? copy.qrFailed
                    : copy.qrScanning}
              </span>
            ) : (
              <span>{copy.menu}</span>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 md:gap-8 md:px-8 md:py-8">
        <div className="sticky top-0 z-20 -mx-1 rounded-lg border border-slate-200/80 bg-white/92 px-3 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur md:-mx-2 md:rounded-[1.75rem]">
          <div className="flex flex-col gap-3 md:gap-4">
            <form
              className="relative"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <label className="sr-only" htmlFor="product-search">
                {copy.searchLabel}
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-24 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-coral focus:bg-white md:rounded-[1.1rem]"
                id="product-search"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                type="search"
                value={searchQuery}
              />
              {searchQuery ? (
                <button
                  className="absolute right-2 top-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  {copy.clearSearch}
                </button>
              ) : null}
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  activeCategory === "all"
                    ? "bg-emerald-600 text-white md:bg-slate-900"
                    : "bg-slate-100 text-slate-600"
                }`}
                onClick={() => {
                  startTransition(() => {
                    setActiveCategory("all");
                  });
                }}
                type="button"
              >
                {copy.allItems}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    activeCategory === category.id
                      ? "bg-emerald-600 text-white md:bg-slate-900"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  onClick={() => {
                    startTransition(() => {
                      setActiveCategory(category.id);
                    });
                  }}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600">
            {copy.noProducts}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600">
            {copy.noResults}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                animate="visible"
                className="group overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_14px_44px_rgba(15,23,42,0.08)] md:rounded-[1.75rem] md:border-white md:shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                custom={index}
                initial="hidden"
                variants={cardMotion}
              >
                <Link
                  className="grid h-full grid-cols-[6.5rem_1fr] gap-4 p-3 md:block md:p-0"
                  href={`/${shop.slug}/products/${product.id}`}
                  onClick={() => {
                    router.prefetch(`/${shop.slug}/products/${product.id}`);
                  }}
                >
                  <div className="relative h-[6.5rem] overflow-hidden rounded-[0.9rem] bg-[linear-gradient(140deg,#fecaca,#fed7aa)] md:h-52 md:rounded-none">
                    {product.imageUrl ? (
                      <Image
                        alt={product.name}
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                        src={product.imageUrl}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#f97316,transparent_45%),linear-gradient(160deg,#0f172a,#1e3a8a)] px-6 text-center text-2xl font-semibold tracking-[-0.03em] text-white">
                        {product.name}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 py-0.5 md:p-5">
                    <div className="flex h-full flex-col justify-between md:hidden">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="min-w-0">
                            <p className="text-[0.68rem] font-black uppercase text-emerald-600 md:text-xs md:text-coral">
                              {product.category?.name ?? copy.products}
                            </p>
                            <h2 className="mt-1 line-clamp-1 text-xl font-black leading-6 text-slate-950 md:mt-2 md:text-2xl">
                              {product.name}
                            </h2>
                          </div>
                          <p className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-500 md:line-clamp-3 md:font-normal md:text-slate-600 md:leading-7">
                          {product.description || copy.descriptionFallback}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          Available
                        </span>
                        <span className="text-sm font-black text-slate-400">
                          {copy.viewDetails}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase text-coral">
                            {product.category?.name ?? copy.products}
                          </p>
                          <h2 className="mt-2 text-2xl font-black leading-6 text-slate-950">
                            {product.name}
                          </h2>
                        </div>
                        <p className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                        {product.description || copy.descriptionFallback}
                      </p>
                      <div className="mt-4 text-sm font-semibold text-slate-900">
                        {copy.viewDetails}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200/80 bg-white/80 px-5 py-6 backdrop-blur md:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-ink">Want a store like this?</p>
            <p className="mt-1">Contact us.</p>
          </div>

          <nav className="grid gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
              href="/"
            >
              <QrCode className="h-4 w-4 text-emerald-700" />
              Create store
            </Link>
            {products[0] ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-ink shadow-sm transition hover:border-slate-400"
                href={`/#`}
              >
                <ShoppingBag className="h-4 w-4 text-coral" />
                Contact us
              </Link>
            ) : null}
          </nav>
        </div>
      </footer>
    </main>
  );
}
