import type {
  DashboardStats,
  EmergencyContact,
  MapPin,
  Notification,
  Report,
  ReportComment,
  User,
} from '@campus/shared-types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    role: 'student',
    studentId: 'STU-2024-001',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    email: 'jordan.lee@university.edu',
    role: 'student',
    studentId: 'STU-2024-042',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'admin-1',
    name: 'Dr. Sarah Mitchell',
    email: 's.mitchell@university.edu',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'James Rodriguez',
    email: 'j.rodriguez@university.edu',
    role: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
  },
];

export const mockReports: Report[] = [
  {
    id: 'report-1',
    title: 'Broken projector in Lecture Hall B',
    description:
      'The projector in Lecture Hall B (Room 204) is not turning on. Tried multiple HDMI ports and power cycling.',
    category: 'it_support',
    status: 'pending',
    priority: 'medium',
    location: 'Science Building - Room 204',
    // Mock campus coordinates (plausible cluster near 40.7128, -74.0060).
    latitude: 40.7132,
    longitude: -74.0056,
    submittedBy: 'user-1',
    imageUrls: [],
    createdAt: '2026-08-10T14:30:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'report-2',
    title: 'Water leak near cafeteria entrance',
    description:
      'There is a persistent water leak from the ceiling near the main cafeteria entrance. Floor is slippery.',
    category: 'maintenance',
    status: 'in_review',
    priority: 'high',
    location: 'Student Center - Main Entrance',
    latitude: 40.7125,
    longitude: -74.0062,
    submittedBy: 'user-2',
    assignedTo: 'admin-2',
    imageUrls: [],
    createdAt: '2026-08-09T09:15:00Z',
    updatedAt: '2026-08-10T11:00:00Z',
    adminNotes: 'Maintenance team dispatched. Area cordoned off.',
  },
  {
    id: 'report-3',
    title: 'Broken handrail on stairwell',
    description:
      'The handrail on the 3rd floor stairwell of the Library is loose and wobbly. Safety hazard.',
    category: 'safety',
    status: 'resolved',
    priority: 'urgent',
    location: 'Library - 3rd Floor Stairwell',
    latitude: 40.7139,
    longitude: -74.0071,
    submittedBy: 'user-1',
    assignedTo: 'admin-1',
    imageUrls: [],
    createdAt: '2026-08-05T16:45:00Z',
    updatedAt: '2026-08-08T10:30:00Z',
    resolvedAt: '2026-08-08T10:30:00Z',
    adminNotes: 'Handrail replaced and secured. Inspection passed.',
  },
  {
    id: 'report-4',
    title: 'Air conditioning not working in dorm',
    description:
      'AC unit in Room 312, West Dorm has been blowing warm air for 3 days.',
    category: 'facilities',
    status: 'pending',
    priority: 'medium',
    location: 'West Dorm - Room 312',
    latitude: 40.7118,
    longitude: -74.0048,
    submittedBy: 'user-2',
    imageUrls: [],
    createdAt: '2026-08-10T18:00:00Z',
    updatedAt: '2026-08-10T18:00:00Z',
  },
  {
    id: 'report-5',
    title: 'Graffiti in parking garage',
    description:
      'Offensive graffiti found on Level 2 of the North Parking Garage near elevator bank.',
    category: 'other',
    status: 'rejected',
    priority: 'low',
    location: 'North Parking Garage - Level 2',
    latitude: 40.7145,
    longitude: -74.008,
    submittedBy: 'user-1',
    assignedTo: 'admin-1',
    imageUrls: [],
    createdAt: '2026-08-07T12:00:00Z',
    updatedAt: '2026-08-08T09:00:00Z',
    adminNotes: 'Duplicate report — already being handled under ticket #4521.',
  },
];

export const mockComments: ReportComment[] = [
  {
    id: 'comment-1',
    reportId: 'report-2',
    authorId: 'admin-2',
    content: 'Maintenance team has been notified. Expect response within 24 hours.',
    createdAt: '2026-08-09T10:00:00Z',
  },
  {
    id: 'comment-2',
    reportId: 'report-3',
    authorId: 'admin-1',
    content: 'Repair completed. Please verify the handrail is secure.',
    createdAt: '2026-08-08T10:30:00Z',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalReports: mockReports.length,
  pendingReports: mockReports.filter((r) => r.status === 'pending').length,
  inReviewReports: mockReports.filter((r) => r.status === 'in_review').length,
  resolvedReports: mockReports.filter((r) => r.status === 'resolved').length,
  rejectedReports: mockReports.filter((r) => r.status === 'rejected').length,
  reportsByCategory: {
    maintenance: mockReports.filter((r) => r.category === 'maintenance').length,
    safety: mockReports.filter((r) => r.category === 'safety').length,
    facilities: mockReports.filter((r) => r.category === 'facilities').length,
    it_support: mockReports.filter((r) => r.category === 'it_support').length,
    other: mockReports.filter((r) => r.category === 'other').length,
  },
};

export const currentStudent = mockUsers.find((u) => u.id === 'user-1')!;
export const currentAdmin = mockUsers.find((u) => u.id === 'admin-1')!;

export function getReportsByUser(userId: string): Report[] {
  return mockReports.filter((r) => r.submittedBy === userId);
}

/**
 * BACKEND TODO: Replace with GET /api/reports/stats
 * Expected response: { open: number; inProgress: number; resolved: number }
 * Current: derived from mock data.
 */
export function getReportStats(): {
  open: number;
  inProgress: number;
  resolved: number;
} {
  return {
    open: mockReports.filter((r) => r.status === 'pending').length,
    inProgress: mockReports.filter((r) => r.status === 'in_review').length,
    resolved: mockReports.filter((r) => r.status === 'resolved').length,
  };
}

/**
 * BACKEND TODO: Replace with GET /api/reports?limit={limit}&sort=createdAt:desc
 * Expected response: Report[]
 * Current: first N mock reports (insertion order matches recency in mock).
 */
export function getRecentReports(limit = 3): Report[] {
  return [...mockReports].slice(0, limit);
}

/**
 * BACKEND TODO: Replace with GET /api/reports?status={status}
 * Expected response: Report[]
 * Current: filtered mock data ('all' returns everything).
 */
export function getReportsByStatus(status: Report['status'] | 'all'): Report[] {
  return status === 'all'
    ? [...mockReports]
    : mockReports.filter((r) => r.status === status);
}

export function getReportById(id: string): Report | undefined {
  return mockReports.find((r) => r.id === id);
}

export function getCommentsByReport(reportId: string): ReportComment[] {
  return mockComments.filter((c) => c.reportId === reportId);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'status_change',
    title: 'Handrail repair completed',
    body: 'Your report "Broken handrail on stairwell" was marked Resolved.',
    reportId: 'report-3',
    createdAt: '2026-08-08T10:35:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'comment',
    title: 'New admin comment',
    body: 'Dr. Sarah Mitchell commented: "Repair completed. Please verify the handrail is secure."',
    reportId: 'report-3',
    createdAt: '2026-08-08T10:30:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    userId: 'user-2',
    type: 'status_change',
    title: 'Report under review',
    body: 'Your report "Water leak near cafeteria entrance" is now In Review.',
    reportId: 'report-2',
    createdAt: '2026-08-10T11:00:00Z',
    read: false,
  },
  {
    id: 'notif-4',
    userId: 'user-2',
    type: 'comment',
    title: 'New admin comment',
    body: 'James Rodriguez commented: "Maintenance team has been notified. Expect response within 24 hours."',
    reportId: 'report-2',
    createdAt: '2026-08-09T10:00:00Z',
    read: true,
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'system',
    title: 'Welcome to CampusFix',
    body: 'Submit reports, track progress, and earn points for helping campus.',
    createdAt: '2025-09-01T08:00:00Z',
    read: true,
  },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-1',
    name: 'Campus Security',
    role: '24/7 Emergency Response',
    phone: '+15550110000',
    priority: 1,
  },
  {
    id: 'emergency-2',
    name: 'Health Services',
    role: 'Urgent Medical Care',
    phone: '+15550110001',
    priority: 2,
  },
  {
    id: 'emergency-3',
    name: 'Facilities On-Call',
    role: 'Urgent Infrastructure Issues',
    phone: '+15550110002',
    priority: 3,
  },
];

/**
 * BACKEND TODO: Replace with GET /api/notifications?userId={userId}
 * Expected response: Notification[] (see shared-types)
 * Current: returns filtered mock data; read/unread state is local-only
 * and resets on reload — persist read-state server-side.
 */
export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

/**
 * BACKEND TODO: Replace with GET /api/notifications?userId={userId}
 * Async variant so screens already branch on isLoading/error/data.
 * Expected response: Notification[] (see shared-types)
 */
export async function fetchNotificationsByUser(
  userId: string,
): Promise<Notification[]> {
  return Promise.resolve(getNotificationsByUser(userId));
}

/**
 * BACKEND TODO: Replace with GET /api/notifications/unread-count?userId={userId}
 * Expected response: { count: number }
 * Current: derived from mock data, local only.
 */
export function getUnreadNotificationCount(userId: string): number {
  return mockNotifications.filter((n) => n.userId === userId && !n.read).length;
}

/**
 * BACKEND TODO: Replace with PATCH /api/notifications/read (body: { userId } or { ids })
 * Expected response: { updated: number }
 * Current: no-op stub — screens update local state only.
 */
export async function markAllNotificationsRead(
  _userId: string,
): Promise<{ updated: number }> {
  return Promise.resolve({ updated: 0 });
}

/**
 * BACKEND TODO: Replace with GET /api/map-pins
 * Expected response: MapPin[] (see shared-types)
 * Current: derived from mock reports with static mock coordinates.
 * Requires Report.latitude/longitude populated server-side via geocoding.
 */
export function getMapPins(): MapPin[] {
  return mockReports
    .filter((r) => r.latitude !== undefined && r.longitude !== undefined)
    .map((r) => ({
      id: r.id,
      title: r.title,
      location: r.location,
      latitude: r.latitude!,
      longitude: r.longitude!,
      status: r.status,
      category: r.category,
    }));
}

/**
 * BACKEND TODO: Replace with GET /api/map-pins
 * Async variant so screens already branch on isLoading/error/data.
 * Expected response: MapPin[] (see shared-types)
 */
export async function fetchMapPins(): Promise<MapPin[]> {
  return Promise.resolve(getMapPins());
}

/**
 * BACKEND TODO: Replace with GET /api/emergency-contacts
 * Expected response: EmergencyContact[] (see shared-types)
 * Current: returns static mock contacts sorted by priority.
 */
export function getEmergencyContacts(): EmergencyContact[] {
  return [...mockEmergencyContacts].sort((a, b) => a.priority - b.priority);
}

/**
 * BACKEND TODO: Replace with GET /api/reports/duplicate-candidates
 * (or fold into POST /api/reports/check-duplicate { category, location, title })
 * Expected response: Array<{ id: string; category: ReportCategory; location: string; title: string }>
 * Current: projects mock reports into duplicate-check shape.
 */
export function getDuplicateCheckReports(): Array<{
  id: string;
  category: Report['category'];
  location: string;
  title: string;
}> {
  return mockReports.map((r) => ({
    id: r.id,
    category: r.category,
    location: r.location,
    title: r.title,
  }));
}

/**
 * BACKEND TODO: Replace with GET /api/emergency-contacts
 * Async variant so screens already branch on isLoading/error/data.
 * Expected response: EmergencyContact[] (see shared-types)
 */
export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  return Promise.resolve(getEmergencyContacts());
}
