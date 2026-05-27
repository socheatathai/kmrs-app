export const locales = ["en", "km"] as const;

export type Locale = (typeof locales)[number];

export const messages = {
  en: {
    menu: "Menu",
    categories: "Categories",
    products: "Products",
    searchLabel: "Search products",
    searchPlaceholder: "Try coffee, noodles, or dessert",
    clearSearch: "Clear",
    noProducts: "No products are available right now.",
    noResults: "No products matched your search.",
    allItems: "All items",
    viewDetails: "View details",
    backToMenu: "Back to menu",
    phone: "Phone",
    address: "Address",
    language: "Language",
    qrScanning: "Opening from QR",
    qrTracked: "Scan recorded",
    qrFailed: "Scan tracking unavailable",
    productUnavailable: "Product not found",
    descriptionFallback: "Freshly prepared and ready to order.",
    catalogReady: "Ready to browse",
  },
  km: {
    menu: "មឺនុយ",
    categories: "ប្រភេទ",
    products: "មុខម្ហូប",
    searchLabel: "ស្វែងរកមុខម្ហូប",
    searchPlaceholder: "សាកល្បង កាហ្វេ គុយទាវ ឬ បង្អែម",
    clearSearch: "សម្អាត",
    noProducts: "មិនមានមុខម្ហូបនៅពេលនេះទេ។",
    noResults: "រកមិនឃើញមុខម្ហូបតាមពាក្យស្វែងរកទេ។",
    allItems: "ទាំងអស់",
    viewDetails: "មើលលម្អិត",
    backToMenu: "ត្រឡប់ទៅមឺនុយ",
    phone: "ទូរស័ព្ទ",
    address: "អាសយដ្ឋាន",
    language: "ភាសា",
    qrScanning: "កំពុងបើកពី QR",
    qrTracked: "បានកត់ត្រាការស្កេន",
    qrFailed: "មិនអាចកត់ត្រាការស្កេនបានទេ",
    productUnavailable: "រកមិនឃើញមុខម្ហូប",
    descriptionFallback: "ចម្អិនថ្មីៗ រួចរាល់សម្រាប់ការកុម្ម៉ង់។",
    catalogReady: "រួចរាល់សម្រាប់មើល",
  },
} as const;

export function getMessage(locale: Locale) {
  return messages[locale];
}
