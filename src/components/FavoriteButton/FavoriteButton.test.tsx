import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { addToFavorites, getFavorites, removeFromFavorites } from '@/lib/api';
import { mockUseAuth, mockUseRouter } from '@/lib/test-utils';

import FavoriteButton from './FavoriteButton';

const mockGetFavorites = getFavorites as jest.Mock;
const mockAddToFavorites = addToFavorites as jest.Mock;
const mockRemoveFromFavorites = removeFromFavorites as jest.Mock;

describe('FavoriteButton', () => {
  const recipeId = 'recipe-123';
  let push: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    push = mockUseRouter();
  });

  it('shows loading state initially', async () => {
    mockUseAuth();
    mockGetFavorites.mockResolvedValue([]);

    render(<FavoriteButton recipeId={recipeId} />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders "Ajouter aux favoris" when recipe is not favorite', async () => {
    mockUseAuth({
      token: null,
      username: null,
      isAuthenticated: false,
    });
    mockGetFavorites.mockResolvedValue([]);

    render(<FavoriteButton recipeId={recipeId} />);

    expect(await screen.findByText('Ajouter aux favoris')).toBeInTheDocument();
  });

  it('renders "Retirer des favoris" when recipe is already favorite', async () => {
    mockUseAuth({
      token: 'token',
      username: 'john',
      isAuthenticated: true,
    });
    mockGetFavorites.mockResolvedValue([{ id: recipeId }]);

    render(<FavoriteButton recipeId={recipeId} />);

    expect(await screen.findByText('Retirer des favoris')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login when clicked', async () => {
    mockUseAuth({
      token: null,
      username: null,
      isAuthenticated: false,
    });
    mockGetFavorites.mockResolvedValue([]);

    render(<FavoriteButton recipeId={recipeId} />);

    // loading finishes immediately for unauthenticated
    const button = await screen.findByRole('button');

    await userEvent.click(button);

    expect(push).toHaveBeenCalledWith(`/login?redirect=/recettes/${recipeId}`);
  });

  it('adds to favorites when clicking and not already favorite', async () => {
    mockUseAuth({
      token: 'token',
      username: 'john',
      isAuthenticated: true,
    });
    mockGetFavorites.mockResolvedValue([]);

    render(<FavoriteButton recipeId={recipeId} />);

    const button = await screen.findByRole('button', {
      name: /ajouter aux favoris/i,
    });

    await userEvent.click(button);

    expect(mockAddToFavorites).toHaveBeenCalledWith(recipeId, 'token', 'john');

    await waitFor(() => {
      expect(screen.getByText('Retirer des favoris')).toBeInTheDocument();
    });
  });

  it('removes from favorites when already favorite', async () => {
    mockUseAuth({
      token: 'token',
      username: 'john',
      isAuthenticated: true,
    });
    mockGetFavorites.mockResolvedValue([{ id: recipeId }]);

    render(<FavoriteButton recipeId={recipeId} />);

    const button = await screen.findByRole('button', {
      name: /retirer des favoris/i,
    });

    await userEvent.click(button);

    expect(mockRemoveFromFavorites).toHaveBeenCalledWith(recipeId, 'token', 'john');

    await waitFor(() => {
      expect(screen.getByText('Ajouter aux favoris')).toBeInTheDocument();
    });
  });

  it('disables button while toggling', async () => {
    mockUseAuth({
      token: 'token',
      username: 'john',
      isAuthenticated: true,
    });
    mockGetFavorites.mockResolvedValue([]);

    let resolvePromise: () => void;

    mockAddToFavorites.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    render(<FavoriteButton recipeId={recipeId} />);

    const button = await screen.findByRole('button');

    await userEvent.click(button);

    expect(button).toBeDisabled();

    resolvePromise!();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('handles getFavorites failure gracefully on mount', async () => {
    mockUseAuth({
      token: 'token',
      username: 'john',
      isAuthenticated: true,
    });
    mockGetFavorites.mockRejectedValue(new Error('fail'));

    render(<FavoriteButton recipeId={recipeId} />);

    expect(await screen.findByText('Ajouter aux favoris')).toBeInTheDocument();
  });
});
