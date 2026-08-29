import type {
  DashboardStats,
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

export function getReportById(id: string): Report | undefined {
  return mockReports.find((r) => r.id === id);
}

export function getCommentsByReport(reportId: string): ReportComment[] {
  return mockComments.filter((c) => c.reportId === reportId);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}
