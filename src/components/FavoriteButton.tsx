'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { addToFavorites, getFavorites, removeFromFavorites } from '@/lib/api';

interface FavoriteButtonProps {
  recipeId: string;
}

export default function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { token, isAuthenticated, username } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      if (!isAuthenticated || !token || !username) {
        setIsLoading(false);
        return;
      }

      try {
        const favorites = await getFavorites(token, username);
        setIsFavorite(favorites.some((fav) => fav.id === recipeId));
      } catch {
        // Silently fail - button will show as not favorite
      } finally {
        setIsLoading(false);
      }
    }

    checkFavorite();
  }, [token, isAuthenticated, username, recipeId]);

  const handleToggle = async () => {
    if (!isAuthenticated || !token || !username) {
      router.push(`/login?redirect=/recettes/${recipeId}`);
      return;
    }

    setIsToggling(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(recipeId, token, username);
        setIsFavorite(false);
      } else {
        await addToFavorites(recipeId, token, username);
        setIsFavorite(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      alert(errorMessage);
      try {
        const favorites = await getFavorites(token, username);
        setIsFavorite(favorites.some((fav) => fav.id === recipeId));
      } catch {
        // Silently fail
      }
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>Chargement...</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFavorite
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md'
          : 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 hover:from-green-200 hover:to-green-100 border border-green-200'
      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{isToggling ? '...' : isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
    </button>
  );
}
