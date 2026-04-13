/**
 * In-memory driver session store.
 * Tracks which booking the driver is currently editing via Telegram,
 * and any staged changes before they commit (send offer / update price).
 */

export interface DriverSession {
  bookingId: string;
  /** If the driver is in a "type a price" flow, we set this flag */
  awaitingPrice: boolean;
  /** If the driver is in a "type extra label" flow */
  awaitingExtraLabel: boolean;
  /** If the driver is typing an extra price */
  awaitingExtraPrice: boolean;
  /** Temporary label for a new extra being added */
  pendingExtraLabel?: string;
}

/**
 * Keyed by Telegram chat ID (number).
 * In production with multiple instances you'd use Redis,
 * but for a single-process deployment this is fine.
 */
const sessions = new Map<number, DriverSession>();

export function getSession(chatId: number): DriverSession | undefined {
  return sessions.get(chatId);
}

export function setSession(chatId: number, session: DriverSession): void {
  sessions.set(chatId, session);
}

export function clearSession(chatId: number): void {
  sessions.delete(chatId);
}

export function updateSession(
  chatId: number,
  patch: Partial<DriverSession>,
): DriverSession | undefined {
  const existing = sessions.get(chatId);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  sessions.set(chatId, updated);
  return updated;
}
