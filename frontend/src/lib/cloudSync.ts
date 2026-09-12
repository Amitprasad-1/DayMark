'use client';

export interface SyncPayload {
  settings?: any;
  activities?: any[];
  sessions?: any[];
  habits?: any[];
  tasks?: any[];
  goals?: any[];
  countdowns?: any[];
  reviews?: any[];
  quotes?: any[];
  exportedAt?: string;
  sourceDevice?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: number;
  formattedDate: string;
  sessionCount: number;
  totalHours: string;
  habitsCount: number;
  tasksCount: number;
  data: SyncPayload;
}

const STORAGE_KEYS = {
  ROOM_ID: 'daymark_sync_room_id',
  LAST_SYNCED: 'daymark_sync_last_timestamp',
  BACKUP_VAULT: 'daymark_backup_vault',
  AUTO_SYNC_ENABLED: 'daymark_auto_sync_enabled',
};

// Generate a memorable 6-character room code like "DM-7842"
export function generateRandomRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DM-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const cloudSync = {
  // Get active Sync Room ID
  getRoomId(): string {
    if (typeof window === 'undefined') return 'DM-MAIN';
    let roomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
    if (!roomId) {
      roomId = generateRandomRoomId();
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
    }
    return roomId.trim().toUpperCase();
  },

  // Set custom Sync Room ID
  setRoomId(roomId: string): void {
    if (typeof window === 'undefined') return;
    const clean = roomId.trim().toUpperCase();
    if (clean) {
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, clean);
    }
  },

  // Auto-sync status
  isAutoSyncEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC_ENABLED);
    return val !== 'false';
  },

  setAutoSyncEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC_ENABLED, String(enabled));
  },

  // Push full payload to current room
  async push(payload: SyncPayload): Promise<{ success: boolean; updatedAt?: number; error?: string }> {
    const roomId = this.getRoomId();
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, payload }),
      });
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      if (data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, String(data.updatedAt));
        }
        return { success: true, updatedAt: data.updatedAt };
      }
      return { success: false, error: data.error };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  // Pull latest payload from current room
  async pull(): Promise<{ found: boolean; payload?: SyncPayload; updatedAt?: number; error?: string }> {
    const roomId = this.getRoomId();
    try {
      const res = await fetch(`/api/sync?room=${encodeURIComponent(roomId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        return { found: false, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      if (data.success && data.found) {
        return {
          found: true,
          payload: data.payload,
          updatedAt: data.updatedAt,
        };
      }
      return { found: false };
    } catch (e: any) {
      return { found: false, error: e.message || 'Network error' };
    }
  },

  // Generate pairing URL to open directly on phone
  getPairingUrl(origin?: string): string {
    const roomId = this.getRoomId();
    const base =
      origin ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://day-mark-one.vercel.app');
    return `${base}/?pairRoom=${encodeURIComponent(roomId)}`;
  },

  // Generate QR code image URL for scanning with phone camera
  getQrCodeUrl(url: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(url)}`;
  },

  // Save an automatic snapshot to local backup vault
  saveSnapshot(payload: SyncPayload): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_VAULT);
      let list: BackupSnapshot[] = [];
      if (raw) {
        try {
          list = JSON.parse(raw);
        } catch {}
      }

      const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      const totalSec = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
      const totalHours = (totalSec / 3600).toFixed(1);

      const newSnapshot: BackupSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        formattedDate: new Date().toLocaleString(),
        sessionCount: sessions.length,
        totalHours,
        habitsCount: Array.isArray(payload.habits) ? payload.habits.length : 0,
        tasksCount: Array.isArray(payload.tasks) ? payload.tasks.length : 0,
        data: payload,
      };

      // Keep up to 10 latest snapshots
      const updated = [newSnapshot, ...list.slice(0, 9)];
      localStorage.setItem(STORAGE_KEYS.BACKUP_VAULT, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save snapshot to backup vault:', e);
    }
  },

  // Retrieve all snapshots in backup vault
  getSnapshots(): BackupSnapshot[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_VAULT);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
};
