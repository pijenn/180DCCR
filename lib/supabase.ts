import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { GameState } from "./types.ts";
import { getInitialGameState } from "./gameEngine.ts";

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

const STORAGE_KEY = "180cr_game_companion_state";
const BROADCAST_CHANNEL_NAME = "180cr_companion_broadcast";

/**
 * Loads current game state from localStorage, or returns default initial state.
 */
export function loadPersistedGameState(): GameState {
  if (typeof window === "undefined") {
    return getInitialGameState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.participants) {
        return parsed as GameState;
      }
    }
  } catch (e) {
    console.warn("Failed to load state from localStorage:", e);
  }
  return getInitialGameState();
}

/**
 * Saves state to localStorage and broadcasts to all active tabs/windows via BroadcastChannel
 * and via Supabase Realtime channel if available.
 */
export function persistAndBroadcastGameState(state: GameState) {
  if (typeof window === "undefined") return;

  const stateWithTimestamp = {
    ...state,
    lastUpdated: Date.now(),
  };

  // 1. LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (e) {
    console.warn("Could not write to localStorage:", e);
  }

  // 2. BroadcastChannel (Cross-tab instant sync)
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage(stateWithTimestamp);
      bc.close();
    }
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }

  // 3. Supabase Realtime channel broadcast (Network sync)
  if (supabase) {
    try {
      const channel = supabase.channel("game_state_room");
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "state_update",
            payload: stateWithTimestamp,
          });
        }
      });
    } catch (e) {
      console.warn("Supabase realtime broadcast error:", e);
    }
  }
}

/**
 * Subscribes to game state updates across BroadcastChannel, window storage events,
 * and Supabase Realtime.
 */
export function subscribeToGameState(onUpdate: (state: GameState) => void): () => void {
  if (typeof window === "undefined") return () => {};

  // 1. BroadcastChannel listener
  let bc: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data && typeof event.data === "object" && event.data.participants) {
        onUpdate(event.data as GameState);
      }
    };
  }

  // 2. Storage event listener (fallback if BroadcastChannel is not supported)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.participants) {
          onUpdate(parsed as GameState);
        }
      } catch (err) {
        console.warn("Error parsing storage update:", err);
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  // 3. Supabase Realtime channel subscription
  let supabaseChannel: RealtimeChannel | null = null;
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel("game_state_room")
        .on(
          "broadcast",
          { event: "state_update" },
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          (payload: any) => {
            if (payload && payload.payload && payload.payload.participants) {
              onUpdate(payload.payload as GameState);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Supabase channel subscribe error:", err);
    }
  }

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener("storage", handleStorage);
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
