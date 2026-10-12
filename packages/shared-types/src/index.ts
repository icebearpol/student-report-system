export type UserRole = 'student' | 'admin';

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'rejected';

export type ReportCategory =
  | 'maintenance'
  | 'safety'
  | 'facilities'
  | 'it_support'
  | 'other';

export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  avatarUrl?: string;
  createdAt: string;
  notificationSettings?: NotificationPreferences;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  priority: ReportPriority;
  location: string;
  // BACKEND REQUIRED going forward: optional today (mock-data supplies
  // plausible campus coordinates), but the real geocoding pipeline must
  // populate latitude/longitude server-side for map pins and proximity.
  latitude?: number;
  longitude?: number;
  submittedBy: string;
  assignedTo?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  inReviewReports: number;
  resolvedReports: number;
  rejectedReports: number;
  reportsByCategory: Record<ReportCategory, number>;
}

export interface CreateReportInput {
  title: string;
  description: string;
  category: ReportCategory;
  priority: ReportPriority;
  location: string;
  imageUrls?: string[];
}

export interface UpdateReportInput {
  status?: ReportStatus;
  priority?: ReportPriority;
  assignedTo?: string;
  adminNotes?: string;
}

export type NotificationType =
  | 'status_change'
  | 'comment'
  | 'system'
  | 'emergency';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  reportId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationPreferences {
  statusChanges: boolean;
  comments: boolean;
  emergency: boolean;
  system: boolean;
}

export interface MapPin {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  category: ReportCategory;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  priority: number;
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  maintenance: 'Maintenance',
  safety: 'Safety',
  facilities: 'Facilities',
  it_support: 'IT Support',
  other: 'Other',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const REPORT_PRIORITY_LABELS: Record<ReportPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
