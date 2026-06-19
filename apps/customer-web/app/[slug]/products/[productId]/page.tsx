import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiBadRequestError, ApiNotFoundError } from "@/lib/api";
import { ProductDetailShell } from "@/components/menu/product-detail-shell";
import { MenuServiceUnavailable } from "@/components/menu/menu-service-unavailable";
import { getPublicMenu, getPublicProduct } from "@/lib/api";
import { siteConfig } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ slug: string; productId: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId, slug } = await params;

  try {
    const [shop, product] = await Promise.all([
      getPublicMenu(slug),
      getPublicProduct(slug, productId),
    ]);
    const description =
      product.description ??
      `View ${product.name} from ${shop.name} on KMRS App.`;
    const image = product.imageUrl ?? shop.logoUrl ?? siteConfig.logo;
    const canonical = `/${slug}/products/${productId}`;

    return {
      title: `${product.name} | ${shop.name}`,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: `${product.name} | ${shop.name}`,
        description,
        images: [{ url: image, alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | ${shop.name}`,
        description,
        images: [image],
      },
    };
  } catch (error) {
    if (
      error instanceof ApiBadRequestError ||
      error instanceof ApiNotFoundError
    ) {
      return {
        title: "Product Not Found",
        robots: { index: false, follow: false },
      };
    }

    return {
      title: "Product Temporarily Unavailable",
      description: "This product is temporarily unavailable. Please try again.",
      robots: { index: false, follow: false },
    };
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

    return (
      <MenuServiceUnavailable
        retryHref={`/${slug}/products/${productId}`}
      />
    );
  }

  return <ProductDetailShell product={productData} shop={shopData} />;
}
