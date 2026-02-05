import { render, screen } from '@testing-library/react';

import { mockUseAuth } from '@/lib/test-utils';

import Navigation from './Navigation';

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

describe('Navigation', () => {
  const logoutMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always shows the main navigation links', async () => {
    mockUseAuth({
      isAuthenticated: false,
      logout: logoutMock,
    });

    render(<Navigation />);

    expect(screen.getByRole('link', { name: /pi food/i })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /recettes/i })).toBeInTheDocument();
  });

  it('shows login link before component mounts (SSR-safe state)', () => {
    mockUseAuth({
      isAuthenticated: false,
      logout: logoutMock,
    });

    render(<Navigation />);

    expect(screen.getByRole('link', { name: /connexion/i })).toBeInTheDocument();
  });

  it('shows favorites and logout when authenticated after mount', async () => {
    mockUseAuth({
      isAuthenticated: true,
      logout: logoutMock,
    });

    render(<Navigation />);

    expect(await screen.findByRole('link', { name: /mes favoris/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /déconnexion/i })).toBeInTheDocument();
  });

  it('calls logout when clicking the logout button', async () => {
    mockUseAuth({
      isAuthenticated: true,
      logout: logoutMock,
    });

    render(<Navigation />);

    const logoutButton = await screen.findByRole('button', {
      name: /déconnexion/i,
    });

    await logoutButton.click();

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('shows login when not authenticated after mount', async () => {
    mockUseAuth({
      isAuthenticated: false,
      logout: logoutMock,
    });

    render(<Navigation />);

    expect(await screen.findByRole('link', { name: /connexion/i })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /déconnexion/i })).not.toBeInTheDocument();
  });
});
