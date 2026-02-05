import { render, screen } from '@testing-library/react';

import RecipeList from './RecipeList';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt } = props;
    return <img src={src} alt={alt} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('RecipeList', () => {
  it('renders empty state when no recipes', () => {
    render(<RecipeList recipes={[]} />);
    expect(screen.getByText(/Aucune recette disponible/i)).toBeInTheDocument();
  });

  it('renders a list of recipes', () => {
    const recipes = [
      { id: '1', name: 'Pasta', prep_time: 10, cook_time: 20, category: 'Main', servings: 2, image_url: '/pasta.jpg' },
      { id: '2', name: 'Salad', prep_time: 5, category: 'Starter', servings: 1 },
    ];

    render(<RecipeList recipes={recipes} />);

    expect(screen.getByText(/Pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/Salad/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Pasta/i })).toHaveAttribute('href', '/recettes/1');
    expect(screen.getByRole('link', { name: /Salad/i })).toHaveAttribute('href', '/recettes/2');

    expect(screen.getByAltText(/Pasta/i)).toHaveAttribute('src', '/pasta.jpg');

    expect(screen.getAllByRole('img', { hidden: true }).some((img) => img.getAttribute('alt') === 'Salad')).toBe(false);
  });

  it('renders recipe details like prep time, cook time, category, and servings', () => {
    const recipes = [{ id: '1', name: 'Soup', prep_time: 5, cook_time: 15, category: 'Starter', servings: 4 }];

    render(<RecipeList recipes={recipes} />);

    expect(screen.getByText(/Prep: 5 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Cuisson: 15 min/i)).toBeInTheDocument();
    expect(screen.getByText(/Starter/i)).toBeInTheDocument();
    expect(screen.getByText(/4 pers./i)).toBeInTheDocument();
  });
});
