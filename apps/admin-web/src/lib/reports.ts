import { getToken } from './auth';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ReportAuthor {
  id: string;
  fullName: string;
  username?: string | null;
  email?: string;
  studentId?: string | null;
  role?: string;
  emailVerified?: boolean;
  urgentStrikes?: number;
  urgentBlocked?: boolean;
}

export interface ReportAlert {
  id: string;
  title: string;
  body: string;
  severity: string;
  expiresAt?: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved';
  location?: string | null;
  category?: string | null;
  priority?: string;
  reportedPriority?: string | null;
  priorityReview?: boolean;
  anonymous?: boolean;
  upvotes?: number;
  imageUrl?: string | null;
  assignedTo?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  aiStatus?: string;
  aiSummary?: string | null;
  aiSuggestedPriority?: string | null;
  flagged?: boolean;
  flagReason?: string | null;
  removedAt?: string | null;
  removedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId?: string | null;
  author?: ReportAuthor | null;
  alert?: ReportAlert | null;
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

export interface AuditEntry {
  id: string;
  action: string;
  detail?: string | null;
  createdAt: string;
  user?: { id: string; email: string; username?: string | null; fullName: string; studentId?: string | null } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

function friendlyError(status: number, body: string): string {
  let parsed: any = null;
  try {
    parsed = JSON.parse(body);
  } catch {}

  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return typeof parsed?.error === 'string' ? parsed.error : 'This account does not have permission to do that.';
  if (status >= 500) return 'Something went wrong on our end. Please try again.';
  if (typeof parsed?.error === 'string') return parsed.error;
  return 'Something went wrong. Please try again.';
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('The app is not connected to the server yet.');
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }

  const text = await res.text();
  if (!res.ok) throw new Error(friendlyError(res.status, text));
  return (text ? JSON.parse(text) : null) as T;
}

export function getAllReports(includeRemoved = false): Promise<Report[]> {
  return call<Report[]>(includeRemoved ? '/reports?includeRemoved=1' : '/reports');
}

export function getReportById(id: string): Promise<Report> {
  return call<Report>(`/reports/${id}`);
}

export function updateReport(
  id: string,
  data: { status?: string; assignedTo?: string; priority?: Priority; dismissFlag?: boolean }
): Promise<Report> {
  return call<Report>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function removeReport(id: string, reason: string): Promise<Report> {
  return call<Report>(`/reports/${id}/remove`, { method: 'POST', body: JSON.stringify({ reason }) });
}

export function restoreReport(id: string): Promise<Report> {
  return call<Report>(`/reports/${id}/restore`, { method: 'POST' });
}

export function getMessages(id: string): Promise<ChatMessage[]> {
  return call<ChatMessage[]>(`/reports/${id}/comments`);
}

export function sendMessage(id: string, body: string): Promise<ChatMessage> {
  return call<ChatMessage>(`/reports/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
}

export function publishAlert(
  id: string,
  data: { title: string; message: string; severity: string; hours: number }
): Promise<ReportAlert> {
  return call<ReportAlert>(`/reports/${id}/alert`, { method: 'POST', body: JSON.stringify(data) });
}

export function retractAlert(id: string): Promise<void> {
  return call<void>(`/reports/${id}/alert`, { method: 'DELETE' });
}

export function getAuditLog(limit = 20): Promise<AuditEntry[]> {
  return call<AuditEntry[]>(`/admin/audit?limit=${limit}`);
}

export function resetStrikes(userId: string): Promise<void> {
  return call<void>(`/admin/users/${userId}/strikes`, { method: 'PATCH' });
}

export function editMessage(id: string, messageId: string, body: string): Promise<ChatMessage> {
  return call<ChatMessage>(`/reports/${id}/comments/${messageId}`, { method: 'PATCH', body: JSON.stringify({ body }) });
}

export function unsendMessage(id: string, messageId: string): Promise<void> {
  return call<void>(`/reports/${id}/comments/${messageId}`, { method: 'DELETE' });
}

export interface RemovedReport {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  category?: string | null;
  status: string;
  priority?: string;
  imageUrl?: string | null;
  createdAt: string;
  removedAt: string;
  removedReason?: string | null;
  purgeAt: string;
  daysLeft: number;
  author?: { id: string; fullName: string; username?: string | null; email: string } | null;
}

export function getRemovedReports(): Promise<{ retentionDays: number; items: RemovedReport[] }> {
  return call<{ retentionDays: number; items: RemovedReport[] }>('/admin/removed');
}

export function deleteRemovedPermanently(id: string): Promise<void> {
  return call<void>(`/admin/removed/${id}`, { method: 'DELETE' });
}