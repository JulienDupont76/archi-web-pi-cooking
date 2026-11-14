// jest.setup.ts remplace globalement '@/lib/api' par un automock : on le desactive
// ici pour tester le vrai module et sa bascule vers les donnees factices.
jest.unmock('@/lib/api');

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_USE_MOCK_API;

async function loadApi(useMock: boolean) {
  process.env.NEXT_PUBLIC_USE_MOCK_API = useMock ? 'true' : 'false';
  let api!: typeof import('./api');
  await jest.isolateModulesAsync(async () => {
    api = await import('./api');
  });
  return api;
}

describe('bascule NEXT_PUBLIC_USE_MOCK_API', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK_API = ORIGINAL_ENV;
  });

  it('sert les donnees factices sans appeler fetch quand le flag vaut "true"', async () => {
    const api = await loadApi(true);

    const recipes = await api.getRecipes();
    const recipe = await api.getRecipe('1');
    const session = await api.login('demo', 'demo');

    expect(recipes.length).toBeGreaterThan(0);
    expect(recipe.name).toBe('Ratatouille provençale');
    expect(session.token).toBe('mock-token-demo');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('appelle l’API distante quand le flag est desactive', async () => {
    const api = await loadApi(false);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [],
      headers: { get: () => 'application/json' },
    });

    await api.getRecipes();

    expect(fetchMock).toHaveBeenCalledWith('https://gourmet.cours.quimerch.com/recipes', expect.anything());
  });
});
