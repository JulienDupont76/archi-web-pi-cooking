import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginPage from '@/app/login/page';
import { login } from '@/lib/api';
import { mockUseAuth, mockUseRouter, mockUseSearchParams } from '@/lib/test-utils';

describe('LoginPage', () => {
  const loginMock = jest.fn();
  let push: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth({
      login: loginMock,
    });
    push = mockUseRouter();
    mockUseSearchParams();
  });

  test('renders form inputs and button', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    expect(screen.getByText(/← retour à l'accueil/i)).toBeInTheDocument();
  });

  test('successful login calls auth login and redirects', async () => {
    (login as jest.Mock).mockResolvedValue({ token: '12345' });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {
      target: { value: 'julien' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('julien', 'password');
      expect(loginMock).toHaveBeenCalledWith('12345', 'julien');
      expect(push).toHaveBeenCalledWith('/'); // default redirect
    });
  });

  test('login redirects to custom redirect if provided in query', async () => {
    (login as jest.Mock).mockResolvedValue({ token: '12345' });
    mockUseSearchParams('/favorites');

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {
      target: { value: 'julien' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/favorites');
    });
  });

  test('shows error when API fails', async () => {
    (login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {
      target: { value: 'julien' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/nom d&apos;utilisateur ou mot de passe incorrect/i)).toBeInTheDocument();
  });

  test('shows error if token is missing from API response', async () => {
    (login as jest.Mock).mockResolvedValue({}); // no token

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {
      target: { value: 'julien' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/token non reçu de la réponse/i)).toBeInTheDocument();
  });

  test('disables button while loading', async () => {
    let resolveApi: (value: { token: string }) => void;
    (login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/nom d'utilisateur/i), {
      target: { value: 'julien' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/connexion\.\.\./i);

    resolveApi!({ token: '12345' });
    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
  });
});
