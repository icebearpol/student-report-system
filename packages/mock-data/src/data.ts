import type {
  BroadcastAlert,
  ChatMessage,
  Ticket,
  CampusLocation,
} from '@campus/shared-types';

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-1',
    name: 'College Building',
    tag: 'COL-001',
    mapX: 41.49,
    mapY: 10.39,
  },
  {
    id: 'loc-2',
    name: 'Student Lounge',
    tag: 'STU-014',
    mapX: 42.51,
    mapY: 25.97,
  },
  {
    id: 'loc-3',
    name: 'College Laboratories',
    tag: 'LAB-020',
    mapX: 64.62,
    mapY: 14.94,
  },
  {
    id: 'loc-4',
    name: 'Dormitory Bldg.',
    tag: 'DORM-027',
    mapX: 79.79,
    mapY: 44.94,
  },
  {
    id: 'loc-5',
    name: 'Track & Field Oval',
    tag: 'OVAL-029',
    mapX: 66.05,
    mapY: 42.86,
  },
  {
    id: 'loc-6',
    name: 'Admin Building',
    tag: 'ADM-007',
    mapX: 27.79,
    mapY: 36.1,
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    anonymousReporterId: 'ANON-7X2K',
    category: 'Infrastructure',
    location: 'College Building',
    description: 'Broken ceiling tile leaking water near study room 3B.',
    urgency: 'High Priority',
    meTooCount: 12,
    status: 'In Progress',
    assignedDepartment: 'Facilities',
    mediaUrl: 'https://picsum.photos/seed/ticket1/400/300',
    createdAt: '2026-08-07T09:15:00Z',
    publishedToWallOfFame: false,
    mapX: 41.49,
    mapY: 10.39,
  },
  {
    id: 'TKT-002',
    anonymousReporterId: 'ANON-9M4P',
    category: 'IT/AV',
    location: 'College Laboratories',
    description: 'Projector in lecture hall 301 not displaying HDMI input.',
    urgency: 'Moderate',
    meTooCount: 4,
    status: 'Under Review',
    assignedDepartment: 'IT Services',
    mediaUrl: 'https://picsum.photos/seed/ticket2/400/300',
    createdAt: '2026-08-08T14:30:00Z',
    publishedToWallOfFame: false,
    mapX: 64.62,
    mapY: 14.94,
  },
  {
    id: 'TKT-003',
    anonymousReporterId: 'ANON-3R8N',
    category: 'Custodial',
    location: 'Student Lounge',
    description: 'Restroom on 2nd floor out of paper towels and soap.',
    urgency: 'Low Impact',
    meTooCount: 8,
    status: 'Submitted',
    assignedDepartment: 'Unassigned',
    createdAt: '2026-08-09T08:00:00Z',
    publishedToWallOfFame: false,
    mapX: 42.51,
    mapY: 25.97,
  },
  {
    id: 'TKT-004',
    anonymousReporterId: 'ANON-1K5W',
    category: 'Abstract/Safety',
    location: 'Dormitory Bldg.',
    description: 'Exterior door lock malfunction — door does not latch properly.',
    urgency: 'Immediate Safety Risk',
    meTooCount: 2,
    status: 'Resolved',
    assignedDepartment: 'Safety & Security',
    mediaUrl: 'https://picsum.photos/seed/ticket4/400/300',
    proofOfFixUrl: 'https://picsum.photos/seed/fix4/400/300',
    createdAt: '2026-08-05T18:45:00Z',
    publishedToWallOfFame: true,
    mapX: 79.79,
    mapY: 44.94,
  },
  {
    id: 'TKT-005',
    anonymousReporterId: 'ANON-6H9Q',
    category: 'Infrastructure',
    location: 'Track & Field Oval',
    description: 'Cracked tile on pool deck — slip hazard.',
    urgency: 'Immediate Safety Risk',
    meTooCount: 6,
    status: 'Awaiting Input',
    assignedDepartment: 'Facilities',
    mediaUrl: 'https://picsum.photos/seed/ticket5/400/300',
    createdAt: '2026-08-09T11:20:00Z',
    publishedToWallOfFame: false,
    mapX: 66.05,
    mapY: 42.86,
  },
];

export const INITIAL_ALERTS: BroadcastAlert[] = [
  {
    id: 'ALR-001',
    severity: 'Warning',
    targetLocation: 'College Building',
    message:
      'Water leak repair in progress. Avoid study rooms 3A–3C until further notice.',
    expiresInHours: 24,
    active: true,
    createdAt: '2026-08-09T07:00:00Z',
    pushNotification: true,
  },
  {
    id: 'ALR-002',
    severity: 'Notice',
    targetLocation: 'Campus-wide',
    message: 'Welcome back! Report issues anonymously via the Campus Report app.',
    expiresInHours: 72,
    active: false,
    createdAt: '2026-08-01T00:00:00Z',
    pushNotification: false,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'MSG-001',
    ticketId: 'TKT-001',
    senderRole: 'User',
    text: 'The leak seems to be getting worse. Can someone check today?',
    timestamp: '2026-08-08T10:00:00Z',
  },
  {
    id: 'MSG-002',
    ticketId: 'TKT-001',
    senderRole: 'Admin',
    text: 'Facilities team is scheduled for 2 PM today. Please avoid the area.',
    timestamp: '2026-08-08T10:15:00Z',
  },
  {
    id: 'MSG-003',
    ticketId: 'TKT-005',
    senderRole: 'Admin',
    text: 'Can you confirm the exact location on the pool deck?',
    timestamp: '2026-08-09T12:00:00Z',
  },
];

export const CURRENT_STUDENT_ID = 'ANON-7X2K';

export function generateAnonymousId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ANON-';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function generateTicketId(): string {
  return `TKT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function generateAlertId(): string {
  return `ALR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function generateMessageId(): string {
  return `MSG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/** Simple text similarity for ML duplicate detection demo */
export function computeSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function findSimilarTickets(
  description: string,
  location: string,
  tickets: Ticket[],
  threshold = 0.85
): Ticket | null {
  for (const ticket of tickets) {
    if (ticket.status === 'Resolved') continue;
    const descSim = computeSimilarity(description, ticket.description);
    const locMatch = ticket.location.toLowerCase() === location.toLowerCase();
    const score = locMatch ? descSim * 0.6 + 0.4 : descSim;
    if (score >= threshold) return ticket;
  }
  return null;
}
