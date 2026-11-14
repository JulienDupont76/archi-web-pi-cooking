import { MOCK_DEFAULT_FAVORITES, MOCK_RECIPES, MOCK_USERS } from './mock-data';
import { Recipe } from './types';

const FAVORITES_STORAGE_KEY = 'mock_favorites';
const TOKEN_PREFIX = 'mock-token-';

// Latence artificielle pour reproduire le comportement asynchrone de la vraie API
// (états de chargement, boutons désactivés, etc.).
const LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Côté serveur (Server Components) le stockage navigateur n'existe pas : on garde
// les favoris en mémoire du process. Côté client, on persiste dans localStorage
// pour que l'état survive aux navigations et aux rechargements.
const serverFavorites = new Map<string, string[]>();

function defaultFavorites(username: string): string[] {
  return [...(MOCK_DEFAULT_FAVORITES[username] ?? [])];
}

function readFavorites(username: string): string[] {
  if (typeof window === 'undefined') {
    if (!serverFavorites.has(username)) {
      serverFavorites.set(username, defaultFavorites(username));
    }
    return [...serverFavorites.get(username)!];
  }

  try {
    const raw = window.localStorage.getItem(`${FAVORITES_STORAGE_KEY}:${username}`);
    if (raw === null) {
      return defaultFavorites(username);
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return defaultFavorites(username);
  }
}

function writeFavorites(username: string, ids: string[]): void {
  if (typeof window === 'undefined') {
    serverFavorites.set(username, ids);
    return;
  }

  try {
    window.localStorage.setItem(`${FAVORITES_STORAGE_KEY}:${username}`, JSON.stringify(ids));
  } catch {
    // Stockage indisponible (navigation privée) : on ignore, l'UI reste utilisable.
  }
}

export async function mockGetRecipes(): Promise<Recipe[]> {
  return delay(clone(MOCK_RECIPES));
}

export async function mockGetRecipe(id: string): Promise<Recipe> {
  const recipe = MOCK_RECIPES.find((item) => item.id === id);
  if (!recipe) {
    throw new Error('Failed to fetch recipe: 404');
  }
  return delay(clone(recipe));
}

export async function mockLogin(username: string, password: string) {
  const expectedPassword = MOCK_USERS[username];
  if (expectedPassword === undefined || expectedPassword !== password) {
    await delay(null);
    throw new Error('Login failed: 401 - invalid credentials');
  }

  return delay({
    token: `${TOKEN_PREFIX}${username}`,
    user: {
      id: username,
      username,
      token: `${TOKEN_PREFIX}${username}`,
    },
  });
}

export async function mockGetFavorites(token: string, username: string): Promise<Recipe[]> {
  if (!token) {
    throw new Error('Failed to fetch favorites: 401');
  }

  const ids = readFavorites(username);
  const favorites = MOCK_RECIPES.filter((recipe) => ids.includes(recipe.id));
  return delay(clone(favorites));
}

export async function mockAddToFavorites(recipeId: string, token: string, username: string) {
  if (!token) {
    throw new Error('Failed to add favorite: 401');
  }
  if (!MOCK_RECIPES.some((recipe) => recipe.id === recipeId)) {
    throw new Error('Failed to add favorite: 404 - unknown recipe');
  }

  const ids = readFavorites(username);
  if (!ids.includes(recipeId)) {
    writeFavorites(username, [...ids, recipeId]);
  }

  return delay({ recipe_id: recipeId, username });
}

export async function mockRemoveFromFavorites(recipeId: string, token: string, username: string) {
  if (!token) {
    throw new Error('Failed to remove favorite: 401');
  }

  const ids = readFavorites(username);
  writeFavorites(
    username,
    ids.filter((id) => id !== recipeId),
  );

  return delay({});
}
