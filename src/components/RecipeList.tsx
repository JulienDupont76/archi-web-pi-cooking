import Image from 'next/image';
import Link from 'next/link';

interface Recipe {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  category?: string;
  servings?: number;
}

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucune recette disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recettes/${recipe.id}`} className="group">
          <article className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Image de la recette */}
            <div className="relative h-48 bg-gray-200">
              {recipe.image_url ? (
                <Image
                  src={recipe.image_url}
                  alt={recipe.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Contenu de la carte */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">{recipe.name}</h3>

              {recipe.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>}

              {/* Informations sur les temps */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {recipe.prep_time && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Prep: {recipe.prep_time} min</span>
                  </div>
                )}

                {recipe.cook_time && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                      />
                    </svg>
                    <span>Cuisson: {recipe.cook_time} min</span>
                  </div>
                )}
              </div>

              {/* Badge catégorie et portions */}
              <div className="mt-3 flex gap-2">
                {recipe.category && (
                  <span className="inline-flex items-center text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">{recipe.category}</span>
                )}
                {recipe.servings && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>{recipe.servings} pers.</span>
                  </span>
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
