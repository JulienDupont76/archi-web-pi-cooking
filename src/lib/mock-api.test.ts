import { mockAddToFavorites, mockGetFavorites, mockGetRecipe, mockGetRecipes, mockLogin, mockRemoveFromFavorites } from './mock-api';
import { MOCK_DEFAULT_FAVORITES, MOCK_RECIPES } from './mock-data';

const TOKEN = 'mock-token-demo';

describe('mock-api', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('mockGetRecipes', () => {
    it('renvoie toutes les recettes factices', async () => {
      const recipes = await mockGetRecipes();
      expect(recipes).toHaveLength(MOCK_RECIPES.length);
      expect(recipes[0].name).toBe(MOCK_RECIPES[0].name);
    });

    it('renvoie une copie pour que l’appelant ne puisse pas muter le jeu de données', async () => {
      const recipes = await mockGetRecipes();
      recipes[0].name = 'Modifié';
      const again = await mockGetRecipes();
      expect(again[0].name).toBe(MOCK_RECIPES[0].name);
    });

    it('expose les champs attendus par RecipeList', async () => {
      const recipes = await mockGetRecipes();
      recipes.forEach((recipe) => {
        expect(recipe.id).toEqual(expect.any(String));
        expect(recipe.name).toEqual(expect.any(String));
        expect(recipe.image_url).toMatch(/^https:\/\/images\.unsplash\.com\//);
      });
    });
  });

  describe('mockGetRecipe', () => {
    it('renvoie la recette correspondant à l’identifiant', async () => {
      const recipe = await mockGetRecipe('9');
      expect(recipe.name).toBe('Risotto aux champignons');
    });

    it('échoue sur un identifiant inconnu', async () => {
      await expect(mockGetRecipe('inconnu')).rejects.toThrow('404');
    });
  });

  describe('mockLogin', () => {
    it('renvoie un token pour des identifiants valides', async () => {
      const response = await mockLogin('demo', 'demo');
      expect(response.token).toBe(TOKEN);
      expect(response.user.username).toBe('demo');
    });

    it('refuse un mot de passe incorrect', async () => {
      await expect(mockLogin('demo', 'mauvais')).rejects.toThrow('401');
    });

    it('refuse un utilisateur inconnu', async () => {
      await expect(mockLogin('personne', 'demo')).rejects.toThrow('401');
    });
  });

  describe('favoris', () => {
    it('part des favoris pré-remplis de l’utilisateur', async () => {
      const favorites = await mockGetFavorites(TOKEN, 'demo');
      expect(favorites.map((recipe) => recipe.id)).toEqual(MOCK_DEFAULT_FAVORITES.demo);
    });

    it('ajoute une recette aux favoris et la persiste', async () => {
      await mockAddToFavorites('4', TOKEN, 'demo');
      const favorites = await mockGetFavorites(TOKEN, 'demo');
      expect(favorites.map((recipe) => recipe.id)).toContain('4');
    });

    it('n’ajoute pas deux fois la même recette', async () => {
      await mockAddToFavorites('4', TOKEN, 'demo');
      await mockAddToFavorites('4', TOKEN, 'demo');
      const favorites = await mockGetFavorites(TOKEN, 'demo');
      expect(favorites.filter((recipe) => recipe.id === '4')).toHaveLength(1);
    });

    it('retire une recette des favoris', async () => {
      await mockRemoveFromFavorites('1', TOKEN, 'demo');
      const favorites = await mockGetFavorites(TOKEN, 'demo');
      expect(favorites.map((recipe) => recipe.id)).not.toContain('1');
    });

    it('isole les favoris par utilisateur', async () => {
      await mockAddToFavorites('4', TOKEN, 'demo');
      const julien = await mockGetFavorites('mock-token-julien', 'julien');
      expect(julien.map((recipe) => recipe.id)).toEqual(MOCK_DEFAULT_FAVORITES.julien);
    });

    it('refuse un ajout sans token', async () => {
      await expect(mockAddToFavorites('1', '', 'demo')).rejects.toThrow('401');
    });

    it('refuse l’ajout d’une recette inexistante', async () => {
      await expect(mockAddToFavorites('inconnu', TOKEN, 'demo')).rejects.toThrow('404');
    });
  });
});
