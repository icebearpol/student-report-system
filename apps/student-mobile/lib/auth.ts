import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor' | 'admin' | 'prefer_not_to_say';
  username?: string;
  studentId?: string;
  profileCompleted?: boolean;
  emailVerified?: boolean;
  urgentBlocked?: boolean;
  token: string;
}

export type Action = 'login' | 'signup' | 'profile' | 'upvote' | 'report' | 'chat' | 'verify' | 'emergency';

const LS_TOKEN = 'campus_token';
const LS_USER = 'campus_user';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

export function friendlyMessage(status: number, body: string, action: Action): string {
  let parsed: any = null;
  try {
    parsed = JSON.parse(body);
  } catch {}

  if (parsed && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    const field = parsed.errors[0]?.path;
    if (field === 'email') return 'Please enter a valid email address.';
    if (field === 'password') return 'Your password must be at least 6 characters.';
    if (field === 'username') return 'Please choose a username between 3 and 24 characters.';
    if (field === 'title') return 'Please enter a short title for your report.';
    if (field === 'description') return 'Please describe the issue.';
    if (field === 'code') return 'Enter the 6-digit code from your email.';
    return 'Some of the information you entered is not valid. Please check and try again.';
  }

  if (status === 401) {
    return action === 'login' ? 'Incorrect email or password.' : 'Your session has expired. Please log in again.';
  }
  if (status === 409 && typeof parsed?.error === 'string') return parsed.error;
  if (status >= 500) return 'Something went wrong on our end. Please try again in a moment.';
  if (typeof parsed?.error === 'string') return parsed.error;
  return 'Something went wrong. Please try again.';
}

export async function request(path: string, init: RequestInit, action: Action) {
  if (!API_BASE) {
    throw new Error('The app is not connected to the server yet.');
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new Error('Cannot reach the server. Please check your internet connection and try again.');
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(friendlyMessage(response.status, text, action));
  }
  return text ? JSON.parse(text) : null;
}

async function saveSession(user: AuthUser) {
  await AsyncStorage.setItem(LS_TOKEN, user.token);
  await AsyncStorage.setItem(LS_USER, JSON.stringify(user));
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(LS_TOKEN);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(LS_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem(LS_TOKEN);
  await AsyncStorage.removeItem(LS_USER);
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await request(
    '/auth/login',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) },
    'login'
  );
  await saveSession(data);
  return data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthUser> {
  const data = await request(
    '/auth/signup',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) },
    'signup'
  );
  await saveSession(data);
  return data;
}

export async function completeProfile(input: {
  username: string;
  studentId?: string;
  role: string;
}): Promise<AuthUser> {
  const token = await getToken();
  const data = await request(
    '/users/me/complete-profile',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(input),
    },
    'profile'
  );
  const current = await getCurrentUser();
  const merged = { ...(current || {}), ...data } as AuthUser;
  await saveSession(merged);
  return merged;
}

export async function refreshMe(): Promise<AuthUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const fresh = await request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }, 'verify');
    const current = await getCurrentUser();
    const merged = { ...(current || {}), ...fresh } as AuthUser;
    await saveSession(merged);
    return merged;
  } catch {
    return getCurrentUser();
  }
}

export async function verifyEmail(code: string): Promise<AuthUser> {
  const token = await getToken();
  const data = await request(
    '/auth/verify-email',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ code }),
    },
    'verify'
  );
  const current = await getCurrentUser();
  const merged = { ...(current || {}), ...data } as AuthUser;
  await saveSession(merged);
  return merged;
}

export async function resendVerification(): Promise<boolean> {
  const token = await getToken();
  const data = await request(
    '/auth/resend-code',
    { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    'verify'
  );
  return !!data?.emailSent;
}

export async function upvoteReport(reportId: string): Promise<void> {
  const token = await getToken();
  await request(
    `/reports/${reportId}/upvote`,
    { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    'upvote'
  );
}

export async function logEmergencyCall(contact: string): Promise<{ allowed: boolean; message?: string }> {
  const token = await getToken();
  if (!token) {
    return { allowed: false, message: 'Please sign in with your school account to contact campus staff.' };
  }
  if (!API_BASE) {
    return { allowed: true };
  }
  try {
    const response = await fetch(`${API_BASE}/emergency/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ contact }),
    });
    if (response.ok) return { allowed: true };
    const text = await response.text();
    return { allowed: false, message: friendlyMessage(response.status, text, 'emergency') };
  } catch {
    return { allowed: true };
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = await getToken();
  await request(
    '/auth/change-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ currentPassword, newPassword }),
    },
    'profile'
  );
}

export async function deleteAccount(password: string): Promise<void> {
  const token = await getToken();
  await request(
    '/auth/delete-account',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ password }),
    },
    'profile'
  );
}