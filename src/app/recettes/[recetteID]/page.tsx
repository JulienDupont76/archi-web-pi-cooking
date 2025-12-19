import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import FavoriteButton from '@/components/FavoriteButton';
import { getRecipe } from '@/lib/api';
import { Recipe } from '@/lib/types';

interface PageProps {
  params: Promise<{
    recetteID: string;
  }>;
}

// Type for API response that can have both snake_case and camelCase formats
interface FetchedRecipe {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  image_url?: string;
  imageUrl?: string;
  image?: string;
  instructions?: string | string[];
  category?: string;
  prep_time?: number;
  prepTime?: number;
  cook_time?: number;
  cookTime?: number;
  servings?: number;
  calories?: number;
  cost?: number;
  difficulty?: string;
  ingredients?: string | string[];
  when_to_eat?: string;
  disclaimer?: string;
}

export async function generateMetadata({ params }: PageProps) {
  const { recetteID } = await params;
  try {
    const fetchedRecipe = (await getRecipe(recetteID)) as FetchedRecipe;
    const recipeName = fetchedRecipe.name || fetchedRecipe.title || 'Recette';
    return {
      title: `${recipeName} - Pi Food`,
      description: fetchedRecipe.description || 'Découvrez cette délicieuse recette',
    };
  } catch {
    return {
      title: 'Recette introuvable - Pi Food',
    };
  }
}

export default async function RecipePage({ params }: PageProps) {
  const { recetteID } = await params;
  let recipe: Recipe | null = null;
  let hasError = false;

  try {
    const fetchedRecipe = (await getRecipe(recetteID)) as FetchedRecipe;
    // Helper function to get numeric value or undefined if 0
    const getNumericValue = (val: number | string | undefined): number | undefined => {
      if (val === undefined || val === null) return undefined;
      const num = Number(val);
      return num && num > 0 ? num : undefined;
    };

    // Normalize the recipe data to handle both API response formats
    recipe = {
      id: fetchedRecipe.id,
      name: fetchedRecipe.name || fetchedRecipe.title || 'Recette sans nom',
      description: fetchedRecipe.description,
      image_url: fetchedRecipe.image_url || fetchedRecipe.imageUrl || fetchedRecipe.image,
      instructions: fetchedRecipe.instructions,
      category: fetchedRecipe.category,
      prep_time: getNumericValue(fetchedRecipe.prep_time || fetchedRecipe.prepTime),
      cook_time: getNumericValue(fetchedRecipe.cook_time || fetchedRecipe.cookTime),
      servings: getNumericValue(fetchedRecipe.servings),
      calories: getNumericValue(fetchedRecipe.calories),
      cost: getNumericValue(fetchedRecipe.cost),
      difficulty: fetchedRecipe.difficulty,
      ingredients: fetchedRecipe.ingredients,
      when_to_eat: fetchedRecipe.when_to_eat,
      disclaimer: fetchedRecipe.disclaimer,
    };
  } catch {
    hasError = true;
  }

  if (hasError || !recipe) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Bouton retour */}
      <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Retour aux recettes</span>
      </Link>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image de la recette */}
        <div className="relative h-64 md:h-96 bg-gray-200">
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Contenu de la recette */}
        <div className="p-6 md:p-8">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">{recipe.name}</h1>
              <FavoriteButton recipeId={recipe.id} />
            </div>

            {recipe.description && <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>}

            {/* Informations principales */}
            <div className="flex flex-wrap gap-4 mb-4">
              {recipe.prep_time && Number(recipe.prep_time) > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Préparation: {recipe.prep_time} min</span>
                </div>
              )}

              {recipe.cook_time && Number(recipe.cook_time) > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                  <span className="font-medium">Cuisson: {recipe.cook_time} min</span>
                </div>
              )}

              {recipe.servings && Number(recipe.servings) > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="font-medium">{recipe.servings} portions</span>
                </div>
              )}

              {recipe.calories && Number(recipe.calories) > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-medium">{recipe.calories} kcal</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {recipe.category && (
                <span className="inline-flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{recipe.category}</span>
              )}
              {recipe.difficulty && (
                <span className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  Difficulté: {recipe.difficulty}
                </span>
              )}
              {(() => {
                // Clean when_to_eat by removing "0" from comma-separated values
                if (!recipe.when_to_eat) return null;
                const cleaned = recipe.when_to_eat
                  .split(',')
                  .map((item) => item.trim())
                  .filter((item) => item !== '' && item !== '0')
                  .join(', ');
                return cleaned ? (
                  <span className="inline-flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">{cleaned}</span>
                ) : null;
              })()}
              {recipe.cost && Number(recipe.cost) > 0 && (
                <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Coût: {recipe.cost}€</span>
              )}
            </div>
          </div>

          {/* Ingrédients */}
          {recipe.ingredients && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Ingrédients
              </h2>
              {Array.isArray(recipe.ingredients) ? (
                <ul className="list-disc list-inside space-y-2 text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-lg">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-lg whitespace-pre-line">{recipe.ingredients}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instructions
              </h2>
              {Array.isArray(recipe.instructions) ? (
                <ol className="list-decimal list-inside space-y-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-lg">
                      {instruction}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-lg whitespace-pre-line">{recipe.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          {recipe.disclaimer && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm italic">{recipe.disclaimer}</p>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
