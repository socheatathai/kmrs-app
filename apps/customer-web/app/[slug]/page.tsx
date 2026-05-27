import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ApiNotFoundError,
  getPublicCategories,
  getPublicMenu,
  getPublicProducts,
} from "@/lib/api";
import { MenuShell } from "@/components/menu/menu-shell";

type MenuPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const shop = await getPublicMenu(slug);

    return {
      title: `${shop.name} | KMRS Menu`,
      description: shop.description ?? `Browse ${shop.name}'s digital menu.`,
    };
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      return {
        title: "Menu not found | KMRS",
      };
    }

    throw error;
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

    throw error;
  }

  return (
    <MenuShell
      categories={categoryData}
      products={productData}
      shop={shopData}
    />
  );
}
