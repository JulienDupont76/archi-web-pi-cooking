import type { Metadata } from 'next';

import RecipeList from '@/components/RecipeList';
import { getRecipes, Recipe } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Recettes - Accueil',
  description: 'Découvrez toutes nos délicieuses recettes',
};

export default async function Home() {
  let recipes: Recipe[] = [];
  let hasError = false;

  try {
    recipes = await getRecipes();
  } catch (error) {
    console.error('Erreur fetching recipes:', error);
    hasError = true;
  }

  if (hasError) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600">Impossible de charger les recettes. Veuillez réessayer plus tard.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Toutes les Recettes</h1>
        <p className="text-gray-600">
          Découvrez {recipes.length} recette{recipes.length > 1 ? 's' : ''} délicieuse{recipes.length > 1 ? 's' : ''}
        </p>
      </div>
      <RecipeList recipes={recipes} />
    </main>
  );
}
