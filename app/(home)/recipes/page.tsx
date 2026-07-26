import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ZedRecipesPage } from "@/components/landing/zed/recipes-page";
import { fetchRecipes } from "@/lib/recipes-server";

export default async function Page() {
  setRequestLocale("en");
  const recipes = await fetchRecipes();
  return <ZedRecipesPage recipes={recipes} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Recipes" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "https://bitrouter.ai/recipes" },
  };
}
