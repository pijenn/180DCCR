import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { GameState, Participant } from "./types.ts";
import { getInitialGameState, getParticipantPhoto, DEFAULT_PARTICIPANTS } from "./gameEngine.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

/**
 * Normalizes user-entered room codes (e.g. "1345", "ROOM-1", "Stage").
 */
export function normalizeRoomCode(code?: string | null): string {
  if (!code || typeof code !== "string") return "default";
  const cleaned = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned : "default";
}

export function getRoomStorageKey(roomCode: string): string {
  return `180cr_room_state_${normalizeRoomCode(roomCode)}`;
}

export function getRoomBroadcastChannelName(roomCode: string): string {
  return `180cr_bc_room_${normalizeRoomCode(roomCode)}`;
}

export function getRoomRealtimeChannelName(roomCode: string): string {
  return `room_${normalizeRoomCode(roomCode)}`;
}

export const TIMER_MS_KEYS = new Set<keyof GameState>([
  "round1TimeRemainingMs",
  "round3TimeRemainingMs",
  "round4TimeRemainingMs",
  "round5TimeRemainingMs",
  "round6TimeRemainingMs",
]);

/**
 * Dynamically re-evaluates active timers based on wall-clock timestamps (`timerEndAt`)
 * so that incoming syncs, hydrations, or broadcasts never jump back to 30000ms.
 */
export function sanitizeTimerState(state: GameState): GameState {
  const now = Date.now();
  const next = { ...state };

  if (next.round1TimerRunning && next.round1TimerEndAt) {
    const remaining = Math.max(0, next.round1TimerEndAt - now);
    next.round1TimeRemainingMs = remaining;
    if (remaining === 0) {
      next.round1TimerRunning = false;
      next.round1TimerEndAt = null;
    }
  }

  if (next.round3TimerRunning && next.round3TimerEndAt) {
    const remaining = Math.max(0, next.round3TimerEndAt - now);
    next.round3TimeRemainingMs = remaining;
    if (remaining === 0) {
      next.round3TimerRunning = false;
      next.round3TimerEndAt = null;
    }
  }

  if (next.round4TimerRunning && next.round4TimerEndAt) {
    const remaining = Math.max(0, next.round4TimerEndAt - now);
    next.round4TimeRemainingMs = remaining;
    if (remaining === 0) {
      next.round4TimerRunning = false;
      next.round4TimerEndAt = null;
    }
  }

  if (next.round5TimerRunning && next.round5TimerEndAt) {
    const remaining = Math.max(0, next.round5TimerEndAt - now);
    next.round5TimeRemainingMs = remaining;
    if (remaining === 0) {
      next.round5TimerRunning = false;
      next.round5TimerEndAt = null;
    }
  }

  if (next.round6TimerRunning && next.round6TimerEndAt) {
    const remaining = Math.max(0, next.round6TimerEndAt - now);
    next.round6TimeRemainingMs = remaining;
    if (remaining === 0) {
      next.round6TimerRunning = false;
      next.round6TimerEndAt = null;
    }
  }

  return next;
}

/**
 * Checks whether a state patch is purely a countdown timer tick (millisecond change only).
 * Pure timer ticks are kept local-only to eliminate network flooding, API spam, and lag.
 */
export function isPureTimerTick(patch: Partial<GameState>, prev: GameState): boolean {
  const keys = Object.keys(patch) as (keyof GameState)[];
  if (keys.length === 0) return true;

  for (const k of keys) {
    if (!TIMER_MS_KEYS.has(k)) {
      if (patch[k] !== prev[k]) {
        return false;
      }
    }
  }

  // Ensure timer running flags didn't toggle
  if (patch.round1TimerRunning !== undefined && patch.round1TimerRunning !== prev.round1TimerRunning) return false;
  if (patch.round3TimerRunning !== undefined && patch.round3TimerRunning !== prev.round3TimerRunning) return false;
  if (patch.round4TimerRunning !== undefined && patch.round4TimerRunning !== prev.round4TimerRunning) return false;
  if (patch.round5TimerRunning !== undefined && patch.round5TimerRunning !== prev.round5TimerRunning) return false;
  if (patch.round6TimerRunning !== undefined && patch.round6TimerRunning !== prev.round6TimerRunning) return false;

  // Ensure timer end timestamps didn't toggle
  if (patch.round1TimerEndAt !== undefined && patch.round1TimerEndAt !== prev.round1TimerEndAt) return false;
  if (patch.round3TimerEndAt !== undefined && patch.round3TimerEndAt !== prev.round3TimerEndAt) return false;
  if (patch.round4TimerEndAt !== undefined && patch.round4TimerEndAt !== prev.round4TimerEndAt) return false;
  if (patch.round5TimerEndAt !== undefined && patch.round5TimerEndAt !== prev.round5TimerEndAt) return false;
  if (patch.round6TimerEndAt !== undefined && patch.round6TimerEndAt !== prev.round6TimerEndAt) return false;

  return true;
}

// In-memory caches per room
const realtimeChannels = new Map<string, RealtimeChannel>();
const channelSubscriptionStatus = new Map<string, boolean>();
const sharedBroadcastChannels = new Map<string, BroadcastChannel>();
const saveDebounceTimers = new Map<string, NodeJS.Timeout>();

function getLocalBroadcastChannel(roomCode: string): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  const key = normalizeRoomCode(roomCode);
  let bc = sharedBroadcastChannels.get(key);
  if (!bc) {
    try {
      bc = new BroadcastChannel(getRoomBroadcastChannelName(key));
      sharedBroadcastChannels.set(key, bc);
    } catch (e) {
      console.warn(`[BroadcastChannel] Init error for room ${key}:`, e);
      return null;
    }
  }
  return bc;
}

export function getRealtimeBroadcastChannel(roomCode: string): RealtimeChannel | null {
  if (!supabase) return null;
  const key = normalizeRoomCode(roomCode);
  let channel = realtimeChannels.get(key);
  if (!channel) {
    channel = supabase.channel(getRoomRealtimeChannelName(key));
    channel.subscribe((status) => {
      const isSubscribed = status === "SUBSCRIBED";
      channelSubscriptionStatus.set(key, isSubscribed);
    });
    realtimeChannels.set(key, channel);
  }
  return channel;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Checks if the clean `game_rooms` table exists in Supabase.
 */
export async function checkSupabaseRoomsTableStatus(): Promise<{
  tableExists: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { tableExists: false, error: "Supabase client not initialized" };
  }
  try {
    const res = await supabase.from("game_rooms").select("room_code").limit(1);
    if (!res.error) {
      return { tableExists: true };
    }
    return { tableExists: false, error: res.error.message };
  } catch (err: unknown) {
    return { tableExists: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Loads game state for a specific room from localStorage, or returns initial default.
 */
export function loadPersistedGameState(roomCodeInput: string = "default"): GameState {
  if (typeof window === "undefined") {
    return getInitialGameState();
  }
  const roomCode = normalizeRoomCode(roomCodeInput);
  try {
    // 1. Try room-specific key
    let raw = localStorage.getItem(getRoomStorageKey(roomCode));

    // 2. Fallback to legacy single key if default room
    if (!raw && (roomCode === "default" || roomCode === "180cr")) {
      raw = localStorage.getItem("180cr_game_companion_state");
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.participants) {
        // Guarantee local avatars for participants
        const sanitizedParticipants = (parsed.participants as Participant[]).map((p) => ({
          ...p,
          avatar: getParticipantPhoto(p.name),
        }));
        return sanitizeTimerState({
          ...parsed,
          participants: sanitizedParticipants,
        } as GameState);
      }
    }
  } catch (e) {
    console.warn(`[State] Failed to load state for room ${roomCode} from localStorage:`, e);
  }
  return getInitialGameState();
}

/**
 * Saves state to local storage and updates active room indicator.
 */
export function savePersistedGameStateLocally(roomCodeInput: string, state: GameState) {
  if (typeof window === "undefined") return;
  const roomCode = normalizeRoomCode(roomCodeInput);
  try {
    localStorage.setItem(getRoomStorageKey(roomCode), JSON.stringify(state));
    localStorage.setItem("180cr_last_room", roomCode);
  } catch (e) {
    console.warn(`[State] Could not write room ${roomCode} to localStorage:`, e);
  }
}

/**
 * Saves state to Supabase `game_rooms` table (one clean JSON document per room).
 */
export async function saveRoomStateToSupabase(
  roomCodeInput: string,
  state: GameState
): Promise<boolean> {
  if (!supabase) return false;
  const roomCode = normalizeRoomCode(roomCodeInput);
  try {
    const { error } = await supabase.from("game_rooms").upsert(
      {
        room_code: roomCode,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_code" }
    );

    if (error) {
      if (error.code !== "PGRST205") {
        console.warn(`[Supabase] Failed to save room ${roomCode}:`, error.message);
      }
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[Supabase] Save room exception for ${roomCode}:`, e);
    return false;
  }
}

/**
 * Fetches latest state for a room from Supabase `game_rooms` table.
 */
export async function fetchRoomStateFromSupabase(
  roomCodeInput: string
): Promise<GameState | null> {
  if (!supabase) return null;
  const roomCode = normalizeRoomCode(roomCodeInput);
  try {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("state, updated_at")
      .eq("room_code", roomCode)
      .maybeSingle();

    if (error) {
      if (error.code !== "PGRST205") {
        console.warn(`[Supabase] Error fetching room ${roomCode}:`, error.message);
      }
      return null;
    }

    if (data && data.state && typeof data.state === "object") {
      const stateObj = data.state as GameState;
      if (stateObj.participants && Array.isArray(stateObj.participants)) {
        // Ensure local avatars
        stateObj.participants = stateObj.participants.map((p) => ({
          ...p,
          avatar: getParticipantPhoto(p.name),
        }));
        return sanitizeTimerState(stateObj);
      }
    }
  } catch (e) {
    console.warn(`[Supabase] Fetch room exception for ${roomCode}:`, e);
  }
  return null;
}

/**
 * Persists state locally, broadcasts across tabs on this machine,
 * broadcasts instantly to other laptops via Supabase Realtime WebSocket,
 * and debounces a durable write to the `game_rooms` table.
 */
export function persistAndBroadcastGameState(
  state: GameState,
  roomCodeInput: string = "default"
) {
  if (typeof window === "undefined") return;
  const roomCode = normalizeRoomCode(roomCodeInput);

  const stateWithTimestamp: GameState = {
    ...state,
    lastUpdated: Date.now(),
  };

  // 1. Instant LocalStorage persistence
  savePersistedGameStateLocally(roomCode, stateWithTimestamp);

  // 2. BroadcastChannel: 0ms sync between tabs/windows on the SAME laptop
  try {
    const bc = getLocalBroadcastChannel(roomCode);
    if (bc) {
      bc.postMessage(stateWithTimestamp);
    }
  } catch (e) {
    console.warn("[BroadcastChannel] Post message error:", e);
  }

  // 3. Supabase Realtime Broadcast: ~30ms instant sync to OTHER laptops in this room
  if (supabase) {
    try {
      const channel = getRealtimeBroadcastChannel(roomCode);
      const isSubscribed = channelSubscriptionStatus.get(roomCode);
      if (channel && isSubscribed) {
        channel.send({
          type: "broadcast",
          event: "state_update",
          payload: stateWithTimestamp,
        });
      }
    } catch (e) {
      console.warn(`[Supabase Realtime] Broadcast error for room ${roomCode}:`, e);
    }
  }

  // 4. Debounced durable database upsert (800ms)
  if (supabase) {
    const existingTimer = saveDebounceTimers.get(roomCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const newTimer = setTimeout(() => {
      saveRoomStateToSupabase(roomCode, stateWithTimestamp).catch((err) => {
        console.warn(`[Supabase] Debounced save failed for room ${roomCode}:`, err);
      });
    }, 800);
    saveDebounceTimers.set(roomCode, newTimer);
  }
}

// Track hydrated rooms to prevent duplicate network fetches on component re-renders
const hydratedRooms = new Set<string>();

/**
 * Subscribes to game state updates for a specific room.
 */
export function subscribeToGameState(
  onUpdate: (state: GameState) => void,
  roomCodeInput: string = "default"
): () => void {
  if (typeof window === "undefined") return () => {};
  const roomCode = normalizeRoomCode(roomCodeInput);

  // 1. Local BroadcastChannel listener (tabs on same machine)
  let bc: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(getRoomBroadcastChannelName(roomCode));
      bc.onmessage = (event) => {
        if (event.data && typeof event.data === "object" && event.data.participants) {
          onUpdate(sanitizeTimerState(event.data as GameState));
        }
      };
    } catch (e) {
      console.warn("[BroadcastChannel] Listener error:", e);
    }
  }

  // 2. Storage event listener (fallback for local multi-tab)
  const expectedKey = getRoomStorageKey(roomCode);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === expectedKey && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.participants) {
          onUpdate(sanitizeTimerState(parsed as GameState));
        }
      } catch (err) {
        console.warn("[Storage] Error parsing update:", err);
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  // 3. Supabase Realtime Broadcast channel (cross-machine live updates)
  let supabaseChannel: RealtimeChannel | null = null;
  if (supabase) {
    try {
      supabaseChannel = getRealtimeBroadcastChannel(roomCode);
      if (supabaseChannel) {
        supabaseChannel.on(
          "broadcast",
          { event: "state_update" },
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          (payload: any) => {
            if (payload && payload.payload && payload.payload.participants) {
              const remoteState = sanitizeTimerState(payload.payload as GameState);
              savePersistedGameStateLocally(roomCode, remoteState);
              onUpdate(remoteState);
            }
          }
        );
      }
    } catch (err) {
      console.warn(`[Supabase] Channel subscribe error for room ${roomCode}:`, err);
    }
  }

  // 4. Async initial hydration from Supabase `game_rooms` table (Runs ONCE per room)
  if (supabase && !hydratedRooms.has(roomCode)) {
    hydratedRooms.add(roomCode);
    fetchRoomStateFromSupabase(roomCode)
      .then((remoteState) => {
        if (remoteState) {
          const localState = loadPersistedGameState(roomCode);
          const remoteTime = remoteState.lastUpdated || 0;
          const localTime = localState.lastUpdated || 0;
          // Only overwrite if remote is strictly newer and local timer isn't currently active
          const isLocalTimerActive =
            (localState.round1TimerRunning && (localState.round1TimerEndAt || 0) > Date.now()) ||
            (localState.round3TimerRunning && (localState.round3TimerEndAt || 0) > Date.now());

          if (remoteTime > localTime && !isLocalTimerActive) {
            savePersistedGameStateLocally(roomCode, remoteState);
            onUpdate(remoteState);
          } else if (localTime > remoteTime) {
            // Local state is newer, sync back up
            saveRoomStateToSupabase(roomCode, localState);
          }
        }
      })
      .catch((err) => {
        console.warn(`[Supabase] Initial room hydration error for ${roomCode}:`, err);
      });
  }

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Backward compatibility helpers for AdminConsole
 */
export async function savePlayersToSupabase(
  participants: Participant[],
  roomCode: string = "default"
): Promise<boolean> {
  const current = loadPersistedGameState(roomCode);
  const updated: GameState = {
    ...current,
    participants,
    lastUpdated: Date.now(),
  };
  persistAndBroadcastGameState(updated, roomCode);
  return saveRoomStateToSupabase(roomCode, updated);
}

export async function saveGameProgressToSupabase(
  roundOrState: number | GameState,
  roomCode: string = "default"
): Promise<boolean> {
  const current = loadPersistedGameState(roomCode);
  const currentRound = typeof roundOrState === "number" ? roundOrState : roundOrState.currentRound;
  const updated: GameState = {
    ...current,
    currentRound,
    lastUpdated: Date.now(),
  };
  persistAndBroadcastGameState(updated, roomCode);
  return saveRoomStateToSupabase(roomCode, updated);
}

export async function seedInitialPlayersToSupabase(roomCode: string = "default"): Promise<boolean> {
  const initial = getInitialGameState();
  persistAndBroadcastGameState(initial, roomCode);
  return saveRoomStateToSupabase(roomCode, initial);
}

export async function checkSupabaseTablesStatus(): Promise<{
  playerTableExists: boolean;
  progressTableExists: boolean;
  error?: string;
}> {
  const { tableExists, error } = await checkSupabaseRoomsTableStatus();
  return {
    playerTableExists: tableExists,
    progressTableExists: tableExists,
    error,
  };
}

export const GAME_ROOMS_SQL_SCHEMA = `-- 180CR TV Companion - Game Rooms Table Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists public.game_rooms (
  room_code text primary key,
  state jsonb not null,
  updated_at timestamptz default now()
);

alter table public.game_rooms enable row level security;

drop policy if exists "Allow public select on game_rooms" on public.game_rooms;
create policy "Allow public select on game_rooms" on public.game_rooms for select using (true);

drop policy if exists "Allow public insert on game_rooms" on public.game_rooms;
create policy "Allow public insert on game_rooms" on public.game_rooms for insert with check (true);

drop policy if exists "Allow public update on game_rooms" on public.game_rooms;
create policy "Allow public update on game_rooms" on public.game_rooms for update using (true);

drop policy if exists "Allow public delete on game_rooms" on public.game_rooms;
create policy "Allow public delete on game_rooms" on public.game_rooms for delete using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'game_rooms'
  ) then
    alter publication supabase_realtime add table public.game_rooms;
  end if;
end $$;`;
