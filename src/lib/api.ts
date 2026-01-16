import { Recipe } from './types';
export type { Recipe } from './types';

const API_BASE_URL = 'https://gourmet.cours.quimerch.com';

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.recipes || [];
  } catch (error) {
    throw error;
  }
}

export async function getRecipe(id: string): Promise<Recipe> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function login(username: string, password: string) {
  const headerVariations = [
    {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/xml',
    },
    {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  ];

  let lastError: Error | null = null;

  for (const headers of headerVariations) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 406) {
          lastError = new Error(`Login failed: ${response.status}`);
          continue;
        }
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.startsWith('<!')) {
          lastError = new Error('Server returned HTML instead of JSON');
          continue;
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && (error.message.includes('406') || error.message.includes('HTML'))) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Login failed: All header variations failed');
}

export async function getFavorites(token: string, username: string): Promise<Recipe[]> {
  const headerVariations = [
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, application/xml',
    },
    {
      Authorization: `Bearer ${token}`,
      Accept: '*/*',
    },
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  ];

  let lastError: Error | null = null;

  for (const headers of headerVariations) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/favorites`, {
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 406) {
          lastError = new Error(`Failed to fetch favorites: ${response.status}`);
          continue;
        }
        throw new Error(`Failed to fetch favorites: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.startsWith('<!')) {
          lastError = new Error('Server returned HTML instead of JSON');
          continue;
        }
      }

      const data = await response.json();

      interface ApiRecipeItem {
        recipe?: {
          id?: string | number;
          recipe_id?: string | number;
          recipeId?: string | number;
          name?: string;
          title?: string;
          description?: string;
          image_url?: string;
          imageUrl?: string;
          image?: string;
          prep_time?: number;
          prepTime?: number;
          cook_time?: number;
          cookTime?: number;
          category?: string;
          servings?: number;
          ingredients?: string | string[];
          instructions?: string | string[];
          difficulty?: string;
          calories?: number;
          cost?: number;
          when_to_eat?: string;
          disclaimer?: string;
        };
        id?: string | number;
        recipe_id?: string | number;
        recipeId?: string | number;
        name?: string;
        title?: string;
        description?: string;
        image_url?: string;
        imageUrl?: string;
        image?: string;
        prep_time?: number;
        prepTime?: number;
        cook_time?: number;
        cookTime?: number;
        category?: string;
        servings?: number;
        ingredients?: string | string[];
        instructions?: string | string[];
        difficulty?: string;
        calories?: number;
        cost?: number;
        when_to_eat?: string;
        disclaimer?: string;
      }

      interface ApiResponse {
        favorites?: ApiRecipeItem[];
        recipes?: ApiRecipeItem[];
      }

      let recipes: ApiRecipeItem[] = [];
      if (Array.isArray(data)) {
        recipes = data.map((item: ApiRecipeItem) => item.recipe || item).filter((r: ApiRecipeItem | null) => r != null);
      } else {
        const apiData = data as ApiResponse;
        if (apiData.favorites && Array.isArray(apiData.favorites)) {
          recipes = apiData.favorites.map((item: ApiRecipeItem) => item.recipe || item).filter((r: ApiRecipeItem | null) => r != null);
        } else if (apiData.recipes && Array.isArray(apiData.recipes)) {
          recipes = apiData.recipes.map((item: ApiRecipeItem) => item.recipe || item).filter((r: ApiRecipeItem | null) => r != null);
        }
      }

      return recipes.map((recipe: ApiRecipeItem) => ({
        id: String(recipe.id || recipe.recipe_id || recipe.recipeId || ''),
        name: recipe.name || recipe.title || 'Recette sans nom',
        description: recipe.description,
        image_url: recipe.image_url || recipe.imageUrl || recipe.image,
        prep_time: recipe.prep_time || recipe.prepTime,
        cook_time: recipe.cook_time || recipe.cookTime,
        category: recipe.category,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        cost: recipe.cost,
        when_to_eat: recipe.when_to_eat,
        disclaimer: recipe.disclaimer,
      }));
    } catch (error) {
      if (error instanceof Error && (error.message.includes('406') || error.message.includes('HTML'))) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Failed to fetch favorites: All header variations failed');
}

export async function addToFavorites(recipeId: string, token: string, username: string) {
  const headerVariations: Array<HeadersInit> = [
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, application/xml',
    },
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: '*/*',
    },
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, application/xml',
    },
  ];

  for (const headers of headerVariations) {
    try {
      const url = `${API_BASE_URL}/users/${username}/favorites?recipeID=${encodeURIComponent(recipeId)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        return await response.json().catch(() => ({}));
      }

      if (response.status === 406) {
        continue;
      }

      const errorText = await response.text().catch(() => 'Could not read error response');
      throw new Error(`Failed to add favorite: ${response.status} - ${errorText}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('406')) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to add favorite: All header variations returned 406');
}

export async function removeFromFavorites(recipeId: string, token: string, username: string) {
  const headerVariations = [
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, application/xml',
    },
    {
      Authorization: `Bearer ${token}`,
      Accept: '*/*',
    },
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  ];

  let lastError: Error | null = null;

  for (const headers of headerVariations) {
    try {
      const url = `${API_BASE_URL}/users/${username}/favorites?recipeID=${encodeURIComponent(recipeId)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (response.ok || response.status === 204) {
        return await response.json().catch(() => ({}));
      }

      if (response.status === 404) {
        return {};
      }

      if (response.status === 406) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text().catch(() => '');
          if (text.startsWith('<!')) {
            lastError = new Error('Server returned HTML instead of JSON');
            continue;
          }
        }
        lastError = new Error(`Failed to remove favorite: ${response.status}`);
        continue;
      }

      const errorText = await response.text().catch(() => '');
      throw new Error(`Failed to remove favorite: ${response.status} - ${errorText}`);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('406') || error.message.includes('HTML'))) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Failed to remove favorite: All header variations failed');
}
