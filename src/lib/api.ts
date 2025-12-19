// src/lib/api.ts
const API_BASE_URL = 'https://gourmet.cours.quimerch.com';

// Types pour l'API
export interface Recipe {
  id: string;
  title: string;
  name: string;
  description?: string;
  image_url?: string;
  image?: string; // Au cas où l'API utilise "image" au lieu de "image_url"
  ingredients?: string[];
  instructions?: string[];
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
}

/**
 * Récupère toutes les recettes
 */
export async function getRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      cache: 'no-store', // Pour toujours avoir les données fraîches
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }

    const data = await response.json();
    console.log('Recipes fetched:', data); // Pour débugger

    // L'API peut retourner directement un tableau ou un objet avec une propriété "recipes"
    return Array.isArray(data) ? data : data.recipes || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

/**
 * Récupère une recette par son ID
 */
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw error;
  }
}

/**
 * Authentification
 */
export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Récupère les favoris de l'utilisateur
 */
export async function getFavorites(token: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

/**
 * Ajoute une recette aux favoris
 */
export async function addToFavorites(recipeId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ recipeId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add favorite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Retire une recette des favoris
 */
export async function removeFromFavorites(recipeId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${recipeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove favorite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}
