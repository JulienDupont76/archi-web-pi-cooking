import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

export const mockUseRouter = () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({
    push,
  });
  return push;
};

export const mockUseSearchParams = (redirectValue: string | null = null) => {
  const get = jest.fn().mockReturnValue(redirectValue);
  (useSearchParams as jest.Mock).mockReturnValue({
    get,
  });
  return get;
};

export const mockUseAuth = (
  config?: Partial<{ token: string | null; username: string | null; isAuthenticated: boolean; logout: jest.Mock; login: jest.Mock }>,
) => {
  const logout = jest.fn();
  const login = jest.fn();
  (useAuth as jest.Mock).mockReturnValue({
    token: 'token',
    username: 'user',
    isAuthenticated: true,
    logout,
    login,
    ...config,
  });
  return { logout };
};
