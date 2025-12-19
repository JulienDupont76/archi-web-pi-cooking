'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import RecipeList from '@/components/RecipeList';
import { useAuth } from '@/contexts/AuthContext';
import { getFavorites } from '@/lib/api';
import { Recipe } from '@/lib/types';

export default function FavoritesPage() {
  const { token, isAuthenticated, username } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token || !username) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const data = await getFavorites(token, username);
      setFavorites(data);
    } catch {
      setError('Impossible de charger vos favoris');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, username]);

  useEffect(() => {
    if (!isAuthenticated || !token || !username) {
      router.push('/login?redirect=/favorites');
      return;
    }

    fetchFavorites();
  }, [token, isAuthenticated, username, router, fetchFavorites]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && token && username) {
        fetchFavorites();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, token, username, fetchFavorites]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Chargement de vos favoris...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">Mes Favoris</h1>
        <p className="text-gray-600">
          {favorites.length === 0
            ? 'Aucune recette favorite pour le moment'
            : `Vous avez ${favorites.length} recette${favorites.length > 1 ? 's' : ''} favorite${favorites.length > 1 ? 's' : ''}`}
        </p>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg">Commencez à ajouter des recettes à vos favoris !</p>
        </div>
      ) : (
        <RecipeList recipes={favorites} />
      )}
    </main>
  );
}
