import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiBadRequestError, ApiNotFoundError } from "@/lib/api";
import { ProductDetailShell } from "@/components/menu/product-detail-shell";
import { getPublicMenu, getPublicProduct } from "@/lib/api";

type ProductPageProps = {
  params: Promise<{ slug: string; productId: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId, slug } = await params;

  try {
    const product = await getPublicProduct(slug, productId);

    return {
      title: `${product.name} | ${slug} | KMRS`,
      description: product.description ?? `View details for ${product.name}.`,
    };
  } catch (error) {
    if (
      error instanceof ApiBadRequestError ||
      error instanceof ApiNotFoundError
    ) {
      return {
        title: "Product not found | KMRS",
      };
    }

    throw error;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId, slug } = await params;
  let shopData: Awaited<ReturnType<typeof getPublicMenu>> | null = null;
  let productData: Awaited<ReturnType<typeof getPublicProduct>> | null = null;

  try {
    [shopData, productData] = await Promise.all([
      getPublicMenu(slug),
      getPublicProduct(slug, productId),
    ]);
  } catch (error) {
    if (
      error instanceof ApiBadRequestError ||
      error instanceof ApiNotFoundError
    ) {
      notFound();
    }

    throw error;
  }

  return <ProductDetailShell product={productData} shop={shopData} />;
}
