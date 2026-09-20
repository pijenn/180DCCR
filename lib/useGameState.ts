import { useSyncExternalStore } from "react";
import { GameState } from "./types.ts";
import { getInitialGameState } from "./gameEngine.ts";
import {
  loadPersistedGameState,
  subscribeToGameState,
  persistAndBroadcastGameState,
} from "./supabase.ts";

let cachedState: GameState = getInitialGameState();

if (typeof window !== "undefined") {
  cachedState = loadPersistedGameState();
}

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useGameState() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      const unsubscribe = subscribeToGameState((newState) => {
        cachedState = newState;
        emitChange();
      });
      return () => {
        listeners.delete(onStoreChange);
        unsubscribe();
      };
    },
    () => cachedState,
    () => getInitialGameState()
  );

  const updateState = (patch: Partial<GameState>) => {
    cachedState = { ...cachedState, ...patch };
    persistAndBroadcastGameState(cachedState);
    emitChange();
  };

  return [state, updateState] as const;
}
