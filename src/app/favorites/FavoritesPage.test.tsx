import { render, screen, waitFor } from '@testing-library/react';

import FavoritesPage from '@/app/favorites/page';
import { getFavorites } from '@/lib/api';
import { mockUseAuth, mockUseRouter } from '@/lib/test-utils';

jest.mock('@/components/RecipeList', () => ({
  __esModule: true,
  default: ({ recipes }: { recipes: unknown[] }) => <div data-testid="recipe-list">{recipes.length} recipes rendered</div>,
}));

describe('FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login if not authenticated', async () => {
    mockUseAuth({ token: null, isAuthenticated: false });
    const push = mockUseRouter();

    render(<FavoritesPage />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/login?redirect=/favorites');
    });
  });

  test('shows loading state', () => {
    mockUseAuth();

    (getFavorites as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<FavoritesPage />);

    expect(screen.getByText(/chargement de vos favoris/i)).toBeInTheDocument();
  });

  test('shows error message when API fails', async () => {
    mockUseAuth();

    (getFavorites as jest.Mock).mockRejectedValue(new Error('API error'));

    render(<FavoritesPage />);

    expect(await screen.findByText(/impossible de charger vos favoris/i)).toBeInTheDocument();
  });

  test('shows empty state when no favorites', async () => {
    mockUseAuth();

    (getFavorites as jest.Mock).mockResolvedValue([]);

    render(<FavoritesPage />);

    expect(await screen.findByText(/aucune recette favorite/i)).toBeInTheDocument();

    expect(screen.getByText(/commencez à ajouter des recettes/i)).toBeInTheDocument();
  });

  test('renders favorites and RecipeList', async () => {
    mockUseAuth();

    const recipes = [
      { id: '1', name: 'Pizza' },
      { id: '2', name: 'Burger' },
    ];

    (getFavorites as jest.Mock).mockResolvedValue(recipes);

    render(<FavoritesPage />);

    expect(await screen.findByText(/vous avez 2 recettes favorites/i)).toBeInTheDocument();

    expect(screen.getByTestId('recipe-list')).toBeInTheDocument();
  });
});
