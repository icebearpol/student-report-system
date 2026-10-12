import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, getCurrentUser } from './auth';

export interface AppNotification {
  id: string;
  type: 'announcement' | 'status' | 'reply';
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'danger';
  reportId?: string | null;
  createdAt: string;
}

export interface NotificationPrefs {
  status: boolean;
  reply: boolean;
}

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const MAX_DISMISSED = 500;
const DEFAULT_PREFS: NotificationPrefs = { status: true, reply: true };

async function ownerKey() {
  const user = await getCurrentUser();
  return user ? user.id : 'guest';
}

async function loadDismissed(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(`campus_notifications_dismissed_${await ownerKey()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function dismissNotifications(ids: string[]) {
  const current = await loadDismissed();
  const merged = Array.from(new Set([...current, ...ids])).slice(-MAX_DISMISSED);
  await AsyncStorage.setItem(`campus_notifications_dismissed_${await ownerKey()}`, JSON.stringify(merged));
}

export async function getPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(`campus_notification_prefs_${await ownerKey()}`);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePrefs(prefs: NotificationPrefs) {
  await AsyncStorage.setItem(`campus_notification_prefs_${await ownerKey()}`, JSON.stringify(prefs));
}

export async function getNotifications(): Promise<AppNotification[]> {
  if (!API_BASE) {
    throw new Error('The app is not connected to the server yet.');
  }
  const token = await getToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/notifications`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }
  if (!response.ok) {
    throw new Error('Could not load notifications right now.');
  }

  const items: AppNotification[] = await response.json();
  const dismissed = new Set(await loadDismissed());
  const prefs = await getPrefs();

  return items.filter(
    (n) =>
      !dismissed.has(n.id) &&
      (n.type !== 'status' || prefs.status) &&
      (n.type !== 'reply' || prefs.reply)
  );
}

async function seenKey() {
  return `campus_notifications_seen_${await ownerKey()}`;
}

export async function getUnreadCount(): Promise<number> {
  const items = await getNotifications();
  const raw = await AsyncStorage.getItem(await seenKey());
  const seen = raw ? Number(raw) : 0;
  return items.filter((n) => new Date(n.createdAt).getTime() > seen).length;
}

export async function markNotificationsSeen(items: AppNotification[]) {
  if (items.length === 0) return;
  const newest = Math.max(...items.map((n) => new Date(n.createdAt).getTime()));
  await AsyncStorage.setItem(await seenKey(), String(newest));
}