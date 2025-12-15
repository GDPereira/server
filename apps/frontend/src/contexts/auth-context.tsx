import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
} from '../api/auth';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../lib/axios';
import type { User, LoginInput, SignupInput, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (input: LoginInput) => Promise<void>;
  signup: (input: Omit<SignupInput, 'confirmPassword'>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const accessToken = getAccessToken();
    const storedUser = localStorage.getItem(USER_KEY);

    if (accessToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        clearTokens();
        localStorage.removeItem(USER_KEY);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setState({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setState({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },
  });

  const login = useCallback(
    async (input: LoginInput) => {
      await loginMutation.mutateAsync(input);
    },
    [loginMutation],
  );

  const signup = useCallback(
    async (input: Omit<SignupInput, 'confirmPassword'>) => {
      await signupMutation.mutateAsync(input);
    },
    [signupMutation],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens();
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
