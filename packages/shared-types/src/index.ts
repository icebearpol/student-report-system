export type TicketCategory =
  | 'Infrastructure'
  | 'Abstract/Safety'
  | 'IT/AV'
  | 'Custodial';

export type TicketUrgency =
  | 'Low Impact'
  | 'Moderate'
  | 'High Priority'
  | 'Immediate Safety Risk';

export type TicketStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Awaiting Input'
  | 'Resolved';

export type AssignedDepartment =
  | 'Facilities'
  | 'Safety & Security'
  | 'IT Services'
  | 'Custodial'
  | 'Unassigned';

export interface Ticket {
  id: string;
  anonymousReporterId: string;
  category: TicketCategory;
  location: string;
  description: string;
  urgency: TicketUrgency;
  meTooCount: number;
  status: TicketStatus;
  assignedDepartment: AssignedDepartment;
  mediaUrl?: string;
  proofOfFixUrl?: string;
  createdAt: string;
  publishedToWallOfFame: boolean;
  /** Map pin coordinates (percentage on campus map) */
  mapX?: number;
  mapY?: number;
}

export type AlertSeverity = 'Notice' | 'Warning' | 'Critical Emergency';

export interface BroadcastAlert {
  id: string;
  severity: AlertSeverity;
  targetLocation: string;
  message: string;
  expiresInHours: number;
  active: boolean;
  createdAt: string;
  pushNotification: boolean;
}

export type ChatSenderRole = 'Admin' | 'User';
export * from './campus-map';
export interface ChatMessage {
  id: string;
  ticketId: string;
  senderRole: ChatSenderRole;
  text: string;
  timestamp: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  tag: string;
  mapX: number;
  mapY: number;
  /** Building footprint as % coordinates on campus-map image (for interactive SVG overlay) */
  polygon?: { x: number; y: number }[];
  /** Label anchor (% coords) — defaults to mapX/mapY */
  labelAnchor?: { x: number; y: number };
  /** Optional real-world coords for future Leaflet / react-native-maps migration */
  latitude?: number;
  longitude?: number;
}

export const DEPARTMENTS: AssignedDepartment[] = [
  'Facilities',
  'Safety & Security',
  'IT Services',
  'Custodial',
  'Unassigned',
];

export const CATEGORIES: TicketCategory[] = [
  'Infrastructure',
  'Abstract/Safety',
  'IT/AV',
  'Custodial',
];

export const URGENCY_LEVELS: TicketUrgency[] = [
  'Low Impact',
  'Moderate',
  'High Priority',
  'Immediate Safety Risk',
];

export const STATUS_STEPS: TicketStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];
