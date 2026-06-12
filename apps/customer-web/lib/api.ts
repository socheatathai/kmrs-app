import { z } from "zod";

import {
  categorySchema,
  productSchema,
  qrCodeSchema,
  qrScanSchema,
  shopSchema,
  type Category,
  type Product,
  type QrCode,
  type QrScanResponse,
  type Shop,
} from "@/lib/types";

const responseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    meta: z
      .object({
        requestId: z.string().optional(),
        timestamp: z.string().optional(),
      })
      .optional(),
  });

export class ApiNotFoundError extends Error {
  constructor() {
    super("API resource not found");
  }
}

export class ApiBadRequestError extends Error {
  constructor() {
    super("API request was rejected");
  }
}

function getApiBaseUrl() {
  const rawBaseUrl = process.env.BASE_URL;

  if (!rawBaseUrl) {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3333";
    }

    throw new Error(
      "Missing BASE_URL environment variable for customer-web. Set it to the deployed core-api origin.",
    );
  }

  const normalized = rawBaseUrl.replace(/\/+$/, "").replace(/\/docs$/, "");

  return normalized;
}

async function request<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  init?: RequestInit,
): Promise<z.infer<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new ApiNotFoundError();
  }

  if (response.status === 400) {
    throw new ApiBadRequestError();
  }

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const envelopeSchema = responseSchema(schema);
  const parsed = envelopeSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Unexpected API response");
  }

  return (parsed.data as unknown as { data: z.infer<T> }).data;
}

export function getPublicMenu(slug: string) {
  return request(`/menu/${slug}`, shopSchema);
}

export function getPublicCategories(slug: string) {
  return request(`/menu/${slug}/categories`, z.array(categorySchema));
}

export function getPublicProducts(slug: string) {
  return request(`/menu/${slug}/products`, z.array(productSchema));
}

export function getPublicProduct(slug: string, productId: string) {
  return request(`/menu/${slug}/products/${productId}`, productSchema);
}

export function getPublicQrCode(slug: string) {
  return request(`/menu/${slug}/qrcode`, qrCodeSchema);
}

export function trackQrScan(slug: string): Promise<QrScanResponse> {
  return request(`/menu/${slug}/qr-scan`, qrScanSchema, {
    method: "POST",
  });
}

export function groupProductsByCategory(
  categories: Category[],
  products: Product[],
) {
  const order = new Map(
    categories.map((category) => [category.id, category.sortOrder]),
  );

  return [...products].sort((left, right) => {
    const leftOrder =
      order.get(left.category?.id ?? "") ?? Number.MAX_SAFE_INTEGER;
    const rightOrder =
      order.get(right.category?.id ?? "") ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.sortOrder - right.sortOrder;
  });
}

export type { Category, Product, QrCode, Shop };
