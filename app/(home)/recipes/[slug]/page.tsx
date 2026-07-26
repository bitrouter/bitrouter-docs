import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ZedRecipeDetail } from "@/components/landing/zed/recipe-detail";
import { fetchRecipeBySlug, fetchRecipes } from "@/lib/recipes-server";

type Props = { params: Promise<{ slug: string }> };

/**
 * Pre-render whatever the catalog holds at build time; anything merged
 * upstream afterwards is rendered on first request and then cached, so a new
 * recipe never needs a docs deploy.
 */
export async function generateStaticParams() {
  const recipes = await fetchRecipes();
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const recipe = await fetchRecipeBySlug(slug);
  if (!recipe) notFound();

  return <ZedRecipeDetail recipe={recipe} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await fetchRecipeBySlug(slug);
  if (!recipe) return {};

  return {
    title: `${recipe.title} — BitRouter recipe`,
    description: recipe.description,
    alternates: { canonical: `https://bitrouter.ai/recipes/${recipe.slug}` },
  };
}
