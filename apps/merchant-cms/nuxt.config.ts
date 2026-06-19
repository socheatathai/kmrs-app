// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  app: {
    head: {
      title: "Merchant Dashboard",
      titleTemplate: "%s | KMRS App",
      htmlAttrs: { lang: "en" },
      meta: [
        {
          name: "description",
          content:
            "Manage digital menus, products, shops, QR codes, and staff with the KMRS App merchant dashboard.",
        },
        { name: "application-name", content: "KMRS App" },
        { name: "theme-color", content: "#c99a2e" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "KMRS App" },
        { property: "og:title", content: "KMRS App | Merchant Dashboard" },
        {
          property: "og:description",
          content:
            "Manage digital menus, products, shops, QR codes, and staff with KMRS App.",
        },
        { property: "og:url", content: "https://kmrs.tech" },
        { property: "og:image", content: "https://kmrs.tech/logo.png" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "KMRS App | Merchant Dashboard" },
        {
          name: "twitter:description",
          content:
            "Manage digital menus, products, shops, QR codes, and staff with KMRS App.",
        },
        { name: "twitter:image", content: "https://kmrs.tech/logo.png" },
        { name: "robots", content: "noindex, nofollow" },
      ],
      link: [
        { rel: "canonical", href: "https://kmrs.tech" },
        { rel: "icon", type: "image/png", href: "/logo.png" },
        { rel: "apple-touch-icon", href: "/logo.png" },
      ],
    },
  },

  devServer: {
    port: 3001,
  },

  devtools: {
    enabled: true,
  },

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "KMRS App",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://kmrs.tech",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://api.kmrs.tech",
      customerWebBase:
        process.env.NUXT_PUBLIC_CUSTOMER_WEB_BASE || "https://www.kmrs.tech",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    },
  },

  modules: ["@nuxt/ui", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  future: {
    compatibilityVersion: 4,
  },
});
