import { z } from "zod";

const priceSchema = z.union([z.number(), z.string()]).transform((value) => {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? 0 : parsed;
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: priceSchema,
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number(),
  category: categorySchema.optional(),
});

export const menuCategorySchema = categorySchema.extend({
  products: z.array(productSchema.omit({ category: true })).optional(),
});

export const shopSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  categories: z.array(menuCategorySchema).optional(),
});

export const qrScanSchema = z.object({
  shopId: z.string(),
  slug: z.string(),
  scannedAt: z.string(),
});

export const qrCodeSchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
  url: z.string(),
  imageUrl: z.string(),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Shop = z.infer<typeof shopSchema>;
export type QrScanResponse = z.infer<typeof qrScanSchema>;
export type QrCode = z.infer<typeof qrCodeSchema>;
