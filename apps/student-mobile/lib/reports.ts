import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, request, getCurrentUser } from './auth';

export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved';
  location?: string | null;
  category?: string | null;
  priority?: string;
  anonymous?: boolean;
  upvotes?: number;
  imageUrl?: string | null;
  assignedTo?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  createdAt: string;
  updatedAt: string;
  authorId?: string | null;
  notice?: string | null;
}

export interface ReportDetail extends Report {
  author?: { id: string; fullName: string; username?: string | null } | null;
  comments?: { id: string; body: string; createdAt: string }[];
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  fromAdmin: boolean;
  mine: boolean;
  canEdit?: boolean;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const LS_ANON_REPORTS = 'campus_anonymous_reports';

export async function getAllReports(): Promise<Report[]> {
  const token = await getToken();
  return request('/reports', { headers: token ? { Authorization: `Bearer ${token}` } : undefined }, 'report');
}

export async function getReportById(id: string): Promise<ReportDetail> {
  const token = await getToken();
  return request(`/reports/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }, 'report');
}

export type CreateReportResult = Report & {
  needsConfirmation?: boolean;
  reason?: string;
  summary?: string;
};

export async function createReport(input: {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  anonymous: boolean;
  imageUrl?: string;
  mapX?: number;
  mapY?: number;
  confirmFlagged?: boolean;
}): Promise<CreateReportResult> {
  const token = await getToken();
  return request(
    '/reports',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(input),
    },
    'report'
  );
}

export async function deleteReport(id: string): Promise<void> {
  const token = await getToken();
  await request(
    `/reports/${id}`,
    { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    'report'
  );
}

export async function rememberAnonymousReport(id: string) {
  try {
    const raw = await AsyncStorage.getItem(LS_ANON_REPORTS);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      await AsyncStorage.setItem(LS_ANON_REPORTS, JSON.stringify(ids));
    }
  } catch {}
}

export async function getAnonymousReportIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LS_ANON_REPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearAnonymousReports() {
  try {
    await AsyncStorage.removeItem(LS_ANON_REPORTS);
  } catch {}
}

async function upvoteStorageKey(): Promise<string> {
  const user = await getCurrentUser();
  return `campus_upvoted_reports_${user ? user.id : 'guest'}`;
}

export async function hasUpvoted(reportId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(await upvoteStorageKey());
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.includes(reportId);
  } catch {
    return false;
  }
}

export async function markUpvoted(reportId: string) {
  try {
    const key = await upvoteStorageKey();
    const raw = await AsyncStorage.getItem(key);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(reportId)) {
      ids.push(reportId);
      await AsyncStorage.setItem(key, JSON.stringify(ids));
    }
  } catch {}
}

export async function uploadPhotoBase64(base64: string, mime: string): Promise<string> {
  if (!API_BASE) {
    throw new Error('The app is not connected to the server yet.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/uploads/base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64, mime }),
    });
  } catch (error) {
    const text = String(error);
    console.log('Upload failed:', text);
    if (text.includes('Network request failed') || text.includes('Failed to fetch')) {
      throw new Error('Cannot reach the server. Please check your connection and try again.');
    }
    throw new Error('Could not upload the photo. Please try again.');
  }

  if (!response.ok) {
    let message = 'Could not upload the photo. Please try again.';
    try {
      const parsed = await response.json();
      if (typeof parsed?.error === 'string') message = parsed.error;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  return data.url as string;
}

export function photoUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${(API_BASE || '').replace(/\/api$/, '')}${path}`;
}

export async function getMessages(reportId: string): Promise<ChatMessage[]> {
  const token = await getToken();
  return request(
    `/reports/${reportId}/comments`,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    'chat'
  );
}

export async function sendMessage(reportId: string, body: string): Promise<ChatMessage> {
  const token = await getToken();
  return request(
    `/reports/${reportId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ body }),
    },
    'chat'
  );
}

export async function editMessage(reportId: string, messageId: string, body: string): Promise<ChatMessage> {
  const token = await getToken();
  return request(
    `/reports/${reportId}/comments/${messageId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ body }),
    },
    'chat'
  );
}

export async function unsendMessage(reportId: string, messageId: string): Promise<void> {
  const token = await getToken();
  await request(
    `/reports/${reportId}/comments/${messageId}`,
    { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined },
    'chat'
  );
}

export interface DuplicateMatch {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  upvotes?: number;
  status?: string;
  createdAt?: string;
}

export interface DuplicateCheck {
  available: boolean;
  match?: DuplicateMatch | null;
  confidence?: number;
  reason?: string;
}

export async function checkDuplicates(input: {
  title: string;
  description: string;
  location: string;
  category: string;
  mapX?: number;
  mapY?: number;
}): Promise<DuplicateCheck> {
  const token = await getToken();
  return request(
    '/reports/duplicates',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(input),
    },
    'report'
  );
}