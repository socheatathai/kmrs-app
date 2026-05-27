"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Locale } from "@/lib/i18n";

type MenuState = {
  locale: Locale;
  activeCategory: string;
  setLocale: (locale: Locale) => void;
  setActiveCategory: (categoryId: string) => void;
};

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      locale: "en",
      activeCategory: "all",
      setLocale: (locale) => set({ locale }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
    }),
    {
      name: "kmrs-customer-menu",
      partialize: (state) => ({
        locale: state.locale,
      }),
    },
  ),
);
