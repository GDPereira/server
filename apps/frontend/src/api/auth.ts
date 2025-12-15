import { api } from '../lib/axios';
import type { AuthResponse, LoginInput, SignupInput } from '../types/auth';

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function signup(
  input: Omit<SignupInput, 'confirmPassword'>,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/signup', input);
  return data;
}

export async function refreshToken(
  refreshToken: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}
