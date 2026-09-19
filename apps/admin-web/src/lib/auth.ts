// Real-backend-ready auth abstraction. Tries fetch, falls back to localStorage mock.
import { mockUsers } from '@campus/mock-data';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  token: string;
}

const LS_USERS = 'campus_users';
const LS_TOKEN = 'campus_token';
const LS_USER = 'campus_user';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

function getStoredUsers(): typeof mockUsers {
  if (typeof window === 'undefined') return [...mockUsers];
  try {
    const raw = localStorage.getItem(LS_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockUsers];
}
function saveStoredUsers(users: typeof mockUsers) {
  if (typeof window !== 'undefined') localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_USER);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LS_TOKEN);
}
export function isAuthenticated(): boolean {
  return !!getToken();
}
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    document.cookie = `campus_token=; Path=/; Max-Age=0`;
  }
}

async function tryRealLogin(email: string, password: string): Promise<AuthUser | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? data;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const real = await tryRealLogin(email, password);
  if (real) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_TOKEN, real.token);
      localStorage.setItem(LS_USER, JSON.stringify(real));
      document.cookie = `campus_token=${real.token}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    }
    return real;
  }
  // Mock fallback: validate against stored users (password: any non-empty suffices, but check if user exists)
  const users = getStoredUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) throw new Error('No account found for this email');
  // accept any password for mock; optional strict: if password.length < 4 throw
  if (!password || password.length < 1) throw new Error('Invalid credentials');
  const token = `mock-${u.id}-${Date.now()}`;
  const authUser: AuthUser = { id: u.id, name: u.name, email: u.email, role: u.role as any, token };
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(authUser));
    document.cookie = `campus_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
  }
  return authUser;
}

async function tryRealSignup(name: string, email: string, password: string): Promise<AuthUser | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? data;
  } catch {
    return null;
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthUser> {
  const real = await tryRealSignup(name, email, password);
  if (real) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_TOKEN, real.token);
      localStorage.setItem(LS_USER, JSON.stringify(real));
      document.cookie = `campus_token=${real.token}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    }
    return real;
  }
  const users = getStoredUsers();
  if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered');
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: 'student' as const,
    studentId: `STU-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser as any);
  saveStoredUsers(users);
  const token = `mock-${newUser.id}-${Date.now()}`;
  const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: 'student', token };
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(authUser));
    document.cookie = `campus_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
  }
  return authUser;
}

export async function upvoteReport(reportId: string): Promise<void> {
  if (API_BASE) {
    try {
      await fetch(`${API_BASE}/reports/${reportId}/upvote`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
      return;
    } catch {}
  }
  // mock no-op persisted in localStorage
  if (typeof window === 'undefined') return;
  const key = `campus_upvotes_${reportId}`;
  const v = Number(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, String(v));
}
