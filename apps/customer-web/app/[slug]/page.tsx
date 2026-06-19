import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ApiNotFoundError,
  getPublicCategories,
  getPublicMenu,
  getPublicProducts,
} from "@/lib/api";
import { MenuShell } from "@/components/menu/menu-shell";
import { MenuServiceUnavailable } from "@/components/menu/menu-service-unavailable";
import { siteConfig } from "@/lib/site";

type MenuPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const shop = await getPublicMenu(slug);
    const description =
      shop.description ?? `Browse ${shop.name}'s digital menu on KMRS App.`;
    const image = shop.coverUrl ?? shop.logoUrl ?? siteConfig.logo;

    return {
      title: `${shop.name} Digital Menu`,
      description,
      alternates: {
        canonical: `/${slug}`,
      },
      openGraph: {
        type: "website",
        url: `/${slug}`,
        title: `${shop.name} Digital Menu`,
        description,
        images: [{ url: image, alt: shop.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${shop.name} Digital Menu`,
        description,
        images: [image],
      },
    };
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      return {
        title: "Menu Not Found",
        robots: { index: false, follow: false },
      };
    }

    return {
      title: "Menu Temporarily Unavailable",
      description: "This menu is temporarily unavailable. Please try again.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  let shopData: Awaited<ReturnType<typeof getPublicMenu>> | null = null;
  let categoryData: Awaited<ReturnType<typeof getPublicCategories>> | null =
    null;
  let productData: Awaited<ReturnType<typeof getPublicProducts>> | null = null;

  try {
    [shopData, categoryData, productData] = await Promise.all([
      getPublicMenu(slug),
      getPublicCategories(slug),
      getPublicProducts(slug),
    ]);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }

    return <MenuServiceUnavailable retryHref={`/${slug}`} />;
  }

  return (
    <MenuShell
      categories={categoryData}
      products={productData}
      shop={shopData}
    />
  );
}
