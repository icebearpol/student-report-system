'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  BroadcastAlert,
  ChatMessage,
  Ticket,
  TicketCategory,
  TicketUrgency,
  AssignedDepartment,
  TicketStatus,
} from '@campus/shared-types';
import {
  INITIAL_TICKETS,
  INITIAL_ALERTS,
  INITIAL_CHAT_MESSAGES,
  CURRENT_STUDENT_ID,
  generateAnonymousId,
  generateTicketId,
  generateAlertId,
  generateMessageId,
  findSimilarTickets,
} from './data';

const STORAGE_KEY = 'campus-report-store';

interface CampusStoreState {
  tickets: Ticket[];
  alerts: BroadcastAlert[];
  chatMessages: ChatMessage[];
  currentStudentId: string;
}

interface CampusStoreActions {
  addTicket: (ticket: Omit<Ticket, 'id' | 'anonymousReporterId' | 'meTooCount' | 'status' | 'assignedDepartment' | 'createdAt' | 'publishedToWallOfFame'>) => { ticket: Ticket; similar: Ticket | null };
  meToo: (ticketId: string) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  reassignDepartment: (ticketId: string, department: AssignedDepartment) => void;
  uploadProofOfFix: (ticketId: string, proofUrl: string) => void;
  toggleWallOfFame: (ticketId: string) => void;
  addAlert: (alert: Omit<BroadcastAlert, 'id' | 'createdAt' | 'active'>) => void;
  deactivateAlert: (alertId: string) => void;
  addChatMessage: (ticketId: string, senderRole: 'Admin' | 'User', text: string) => void;
  getActiveAlert: () => BroadcastAlert | null;
  getMyTickets: () => Ticket[];
  getWallOfFameTickets: () => Ticket[];
}

type CampusStore = CampusStoreState & CampusStoreActions;

const defaultState: CampusStoreState = {
  tickets: INITIAL_TICKETS,
  alerts: INITIAL_ALERTS,
  chatMessages: INITIAL_CHAT_MESSAGES,
  currentStudentId: CURRENT_STUDENT_ID,
};

function hasBrowserStorage(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined' &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function'
    );
  } catch {
    return false;
  }
}

function canListen(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function' &&
      typeof window.removeEventListener === 'function'
    );
  } catch {
    return false;
  }
}

function getRaw(): string | null {
  if (!hasBrowserStorage()) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setRaw(serialized: string): void {
  if (!hasBrowserStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    /* ignore */
  }
}

function broadcast(): void {
  if (!canListen()) return;
  try {
    window.dispatchEvent(new CustomEvent('campus-store-update'));
  } catch {
    /* ignore */
  }
}

function loadFromStorage(): CampusStoreState {
  const raw = getRaw();
  if (!raw) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: CampusStoreState, lastWrittenRef?: { current: string | null }) {
  if (!hasBrowserStorage()) return;
  try {
    const serialized = JSON.stringify(state);
    // Skip write + broadcast when nothing changed (breaks save -> event -> setState loop).
    if (lastWrittenRef && lastWrittenRef.current === serialized) return;
    setRaw(serialized);
    if (lastWrittenRef) lastWrittenRef.current = serialized;
    broadcast();
  } catch {
    /* ignore */
  }
}

const CampusContext = createContext<CampusStore | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CampusStoreState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const lastWrittenRef = useRef<string | null>(null);

  useEffect(() => {
    // Initial client hydration: adopt persisted state once so server HTML
    // (defaultState) matches first client render, then updates cleanly.
    // On Android native (Hermes) there is no localStorage / addEventListener:
    // run in-memory only.
    const raw = getRaw();
    if (raw) {
      try {
        lastWrittenRef.current = raw;
        setState({ ...defaultState, ...JSON.parse(raw) });
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);

    if (!canListen()) return;

    const sync = () => {
      try {
        const next = getRaw();
        // Ignore self-echo broadcasts; only adopt external changes.
        if (!next || next === lastWrittenRef.current) return;
        lastWrittenRef.current = next;
        setState({ ...defaultState, ...JSON.parse(next) });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('campus-store-update', sync);
    window.addEventListener('storage', sync);
    return () => {
      try {
        window.removeEventListener('campus-store-update', sync);
        window.removeEventListener('storage', sync);
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveToStorage(state, lastWrittenRef);
  }, [state, hydrated]);

  const addTicket = useCallback(
    (
      partial: Omit<
        Ticket,
        | 'id'
        | 'anonymousReporterId'
        | 'meTooCount'
        | 'status'
        | 'assignedDepartment'
        | 'createdAt'
        | 'publishedToWallOfFame'
      >
    ) => {
      const similar = findSimilarTickets(
        partial.description,
        partial.location,
        state.tickets
      );
      const ticket: Ticket = {
        ...partial,
        id: generateTicketId(),
        anonymousReporterId: generateAnonymousId(),
        meTooCount: 0,
        status: 'Submitted',
        assignedDepartment: 'Unassigned',
        createdAt: new Date().toISOString(),
        publishedToWallOfFame: false,
      };
      setState((prev) => ({
        ...prev,
        tickets: [ticket, ...prev.tickets],
      }));
      return { ticket, similar };
    },
    [state.tickets]
  );

  const meToo = useCallback((ticketId: string) => {
    setState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === ticketId ? { ...t, meTooCount: t.meTooCount + 1 } : t
      ),
    }));
  }, []);

  const updateTicket = useCallback(
    (ticketId: string, updates: Partial<Ticket>) => {
      setState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticketId ? { ...t, ...updates } : t
        ),
      }));
    },
    []
  );

  const updateTicketStatus = useCallback(
    (ticketId: string, status: TicketStatus) => {
      updateTicket(ticketId, { status });
    },
    [updateTicket]
  );

  const reassignDepartment = useCallback(
    (ticketId: string, department: AssignedDepartment) => {
      updateTicket(ticketId, {
        assignedDepartment: department,
        status: department === 'Unassigned' ? 'Submitted' : 'In Progress',
      });
    },
    [updateTicket]
  );

  const uploadProofOfFix = useCallback(
    (ticketId: string, proofUrl: string) => {
      updateTicket(ticketId, {
        proofOfFixUrl: proofUrl,
        status: 'Resolved',
      });
    },
    [updateTicket]
  );

  const toggleWallOfFame = useCallback(
    (ticketId: string) => {
      setState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, publishedToWallOfFame: !t.publishedToWallOfFame }
            : t
        ),
      }));
    },
    []
  );

  const addAlert = useCallback(
    (partial: Omit<BroadcastAlert, 'id' | 'createdAt' | 'active'>) => {
      const alert: BroadcastAlert = {
        ...partial,
        id: generateAlertId(),
        createdAt: new Date().toISOString(),
        active: true,
      };
      setState((prev) => ({
        ...prev,
        alerts: [
          alert,
          ...prev.alerts.map((a) => ({ ...a, active: false })),
        ],
      }));
    },
    []
  );

  const deactivateAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === alertId ? { ...a, active: false } : a
      ),
    }));
  }, []);

  const addChatMessage = useCallback(
    (ticketId: string, senderRole: 'Admin' | 'User', text: string) => {
      const msg: ChatMessage = {
        id: generateMessageId(),
        ticketId,
        senderRole,
        text,
        timestamp: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, msg],
      }));
    },
    []
  );

  const getActiveAlert = useCallback((): BroadcastAlert | null => {
    return state.alerts.find((a) => a.active) ?? null;
  }, [state.alerts]);

  const getMyTickets = useCallback((): Ticket[] => {
    return state.tickets.filter(
      (t) => t.anonymousReporterId === state.currentStudentId
    );
  }, [state.tickets, state.currentStudentId]);

  const getWallOfFameTickets = useCallback((): Ticket[] => {
    return state.tickets.filter(
      (t) => t.publishedToWallOfFame && t.proofOfFixUrl
    );
  }, [state.tickets]);

  const store = useMemo<CampusStore>(
    () => ({
      ...state,
      addTicket,
      meToo,
      updateTicket,
      updateTicketStatus,
      reassignDepartment,
      uploadProofOfFix,
      toggleWallOfFame,
      addAlert,
      deactivateAlert,
      addChatMessage,
      getActiveAlert,
      getMyTickets,
      getWallOfFameTickets,
    }),
    [
      state,
      addTicket,
      meToo,
      updateTicket,
      updateTicketStatus,
      reassignDepartment,
      uploadProofOfFix,
      toggleWallOfFame,
      addAlert,
      deactivateAlert,
      addChatMessage,
      getActiveAlert,
      getMyTickets,
      getWallOfFameTickets,
    ]
  );

  return (
    <CampusContext.Provider value={store}>{children}</CampusContext.Provider>
  );
}

export function useCampusStore(): CampusStore {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useCampusStore must be used within CampusProvider');
  }
  return ctx;
}

export * from './data';
