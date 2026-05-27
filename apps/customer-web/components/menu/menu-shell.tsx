"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Languages,
  MapPin,
  Phone,
  QrCode,
  Search,
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
      <section className="relative overflow-hidden border-b border-white/50 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_28%),linear-gradient(160deg,#0f172a_0%,#172554_42%,#1d4ed8_100%)] px-5 pb-10 pt-8 text-white md:px-8 md:pb-14 md:pt-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10">
                {shop.logoUrl ? (
                  <Image
                    alt={shop.name}
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={shop.logoUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/10 text-2xl font-semibold">
                    {shop.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/75">
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.catalogReady}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                  {shop.name}
                </h1>
                {shop.description ? (
                  <p className="max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                    {shop.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex min-w-[8rem] flex-col gap-2 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                <Languages className="h-3.5 w-3.5" />
                {copy.language}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["en", "km"] as const).map((option) => (
                  <button
                    key={option}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      locale === option
                        ? "bg-white text-slate-900"
                        : "bg-white/10 text-white/85"
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
          </div>

          <div className="grid gap-3 text-sm text-white/80 md:grid-cols-3">
            {shop.phone ? (
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60">
                  <Phone className="h-3.5 w-3.5" />
                  {copy.phone}
                </p>
                <p className="mt-2 font-medium text-white">{shop.phone}</p>
              </div>
            ) : null}
            {shop.address ? (
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 md:col-span-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60">
                  <MapPin className="h-3.5 w-3.5" />
                  {copy.address}
                </p>
                <p className="mt-2 font-medium text-white">{shop.address}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
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

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-6 md:px-8 md:py-8">
        <div className="sticky top-0 z-20 -mx-2 rounded-[1.75rem] border border-slate-200/80 bg-white/88 px-3 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4">
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
                className="h-12 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 pl-11 pr-24 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-coral focus:bg-white"
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
                  className="absolute right-2 top-2 rounded-[0.9rem] bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  {copy.clearSearch}
                </button>
              ) : null}
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === "all"
                    ? "bg-slate-900 text-white"
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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category.id
                      ? "bg-slate-900 text-white"
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
                className="group overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                custom={index}
                initial="hidden"
                variants={cardMotion}
              >
                <Link
                  className="block h-full"
                  href={`/${shop.slug}/products/${product.id}`}
                  onClick={() => {
                    router.prefetch(`/${shop.slug}/products/${product.id}`);
                  }}
                >
                  <div className="relative h-52 overflow-hidden bg-[linear-gradient(140deg,#fecaca,#fed7aa)]">
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
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-coral">
                          {product.category?.name ?? copy.products}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                          {product.name}
                        </h2>
                      </div>
                      <p className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                      {product.description || copy.descriptionFallback}
                    </p>
                    <div className="text-sm font-semibold text-slate-900">
                      {copy.viewDetails}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
