"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { GameState } from "./types.ts";
import { getInitialGameState } from "./gameEngine.ts";
import {
  loadPersistedGameState,
  subscribeToGameState,
  persistAndBroadcastGameState,
  normalizeRoomCode,
  isPureTimerTick,
} from "./supabase.ts";

export { isPureTimerTick } from "./supabase.ts";

interface RoomStore {
  roomCode: string;
  cachedState: GameState;
  listeners: Set<() => void>;
  activeUnsubscribe: (() => void) | null;
  subscribe: (listener: () => void) => () => void;
  getState: () => GameState;
  setState: (patch: Partial<GameState>, options?: { localOnly?: boolean }) => void;
}

const roomStores = new Map<string, RoomStore>();

function getOrCreateRoomStore(roomCode: string): RoomStore {
  let store = roomStores.get(roomCode);
  if (!store) {
    const listeners = new Set<() => void>();
    const initial = loadPersistedGameState(roomCode);

    const roomStore: RoomStore = {
      roomCode,
      cachedState: initial,
      listeners,
      activeUnsubscribe: null,
      getState: () => roomStore.cachedState,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        if (!roomStore.activeUnsubscribe) {
          roomStore.activeUnsubscribe = subscribeToGameState((newState) => {
            roomStore.cachedState = newState;
            listeners.forEach((l) => l());
          }, roomCode);
        }
        return () => {
          listeners.delete(listener);
          if (listeners.size === 0 && roomStore.activeUnsubscribe) {
            roomStore.activeUnsubscribe();
            roomStore.activeUnsubscribe = null;
          }
        };
      },
      setState: (patch: Partial<GameState>, options?: { localOnly?: boolean }) => {
        const isTick = options?.localOnly ?? isPureTimerTick(patch, roomStore.cachedState);
        roomStore.cachedState = { ...roomStore.cachedState, ...patch };
        if (!isTick) {
          persistAndBroadcastGameState(roomStore.cachedState, roomCode);
        }
        listeners.forEach((l) => l());
      },
    };

    roomStores.set(roomCode, roomStore);
    return roomStore;
  }
  return store;
}

const initialServerSnapshot: GameState = getInitialGameState();
const getServerSnapshot = () => initialServerSnapshot;

function getStoredActiveRoom(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("180cr_last_room");
      if (stored) return normalizeRoomCode(stored);
    } catch {}
  }
  return "default";
}

/**
 * Main game state hook with automatic Room Code synchronization.
 * If roomCode is passed, uses that room.
 * Otherwise, inspects URL params (e.g. /[roomCode]) or falls back to last visited room.
 */
export function useGameState(explicitRoomCode?: string) {
  let paramRoom: string | undefined;
  try {
    const params = useParams();
    if (params && params.roomCode) {
      paramRoom = Array.isArray(params.roomCode) ? params.roomCode[0] : params.roomCode;
    }
  } catch {
    // useParams might throw or return null outside router context (e.g. unit tests)
  }

  const effectiveRoomCode = useMemo(() => {
    return normalizeRoomCode(explicitRoomCode || paramRoom || getStoredActiveRoom());
  }, [explicitRoomCode, paramRoom]);

  const store = useMemo(() => getOrCreateRoomStore(effectiveRoomCode), [effectiveRoomCode]);

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    getServerSnapshot
  );

  const updateState = useCallback(
    (patch: Partial<GameState>, options?: { localOnly?: boolean }) => {
      store.setState(patch, options);
    },
    [store]
  );

  return [state, updateState, effectiveRoomCode] as const;
}
