export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor' | 'admin' | 'prefer_not_to_say';
  username?: string;
  token: string;
}

const LS_TOKEN = 'campus_token';
const LS_USER = 'campus_user';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

function saveSession(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_TOKEN, user.token);
  localStorage.setItem(LS_USER, JSON.stringify(user));
  document.cookie = `campus_token=${user.token}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LS_TOKEN);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
  document.cookie = `campus_token=; Path=/; Max-Age=0`;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (!API_BASE) {
    throw new Error('The app is not connected to the server yet.');
  }
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  if (!res.ok) {
    let message = 'Login failed.';
    try {
      message = JSON.parse(text).error || message;
    } catch {}
    throw new Error(message);
  }
  const data = JSON.parse(text);
  const user: AuthUser = data.user ?? data;
  if (user.role !== 'admin') {
    throw new Error('This account does not have admin access.');
  }
  saveSession(user);
  return user;
}

export async function signup(name: string, email: string, password: string): Promise<AuthUser> {
  if (!API_BASE) {
    throw new Error('The app is not connected to the server yet.');
  }
  const res = await fetch(`${API_BASE}/auth/admin-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    let message = 'Signup failed.';
    try {
      message = JSON.parse(text).error || message;
    } catch {}
    throw new Error(message);
  }

  return login(email, password);
}