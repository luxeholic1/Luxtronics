export type UserOrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface UserOrder {
  id: string;
  date: string;
  amount: string;
  status: UserOrderStatus;
}

export interface AccountUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  orders: UserOrder[];
  createdAt: string;
  updatedAt: string;
}

interface AuthSuccess {
  token: string;
  user: AccountUser;
}

const AUTH_TOKEN_KEY = 'luxtronics_auth_token';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Request failed');
  }

  return json.data as T;
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthSuccess> {
  const response = await fetch(apiUrl('/api/users/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthSuccess>(response);
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthSuccess> {
  const response = await fetch(apiUrl('/api/users/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthSuccess>(response);
}

export async function getCurrentUser(token: string): Promise<AccountUser> {
  const response = await fetch(apiUrl('/api/users/me'), {
    method: 'GET',
    headers: authHeaders(token),
  });

  return parseResponse<AccountUser>(response);
}

export async function updateCurrentUser(
  token: string,
  payload: { firstName?: string; lastName?: string; phone?: string }
): Promise<AccountUser> {
  const response = await fetch(apiUrl('/api/users/me'), {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse<AccountUser>(response);
}

export async function logoutUser(token: string): Promise<void> {
  const response = await fetch(apiUrl('/api/users/logout'), {
    method: 'POST',
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}
