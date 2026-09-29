import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getInitialGameState } from "../lib/gameEngine.ts";
import {
  normalizeRoomCode,
  getRoomStorageKey,
  getRoomBroadcastChannelName,
  getRoomRealtimeChannelName,
  isPureTimerTick,
} from "../lib/supabase.ts";
import type { GameState } from "../lib/types.ts";

describe("State Synchronization & Room Architecture", () => {
  it("should create valid initial game state structure", () => {
    const state = getInitialGameState();
    assert.equal(state.currentRound, 1);
    assert.equal(state.subRoundIndex, 0);
    assert.equal(state.round1Phase, "idle");
    assert.equal(state.round2TargetAnswer, 1467);
    assert.equal(state.round4SpinNames!.length, 9);
    assert.equal(state.round5SpinNames!.length, 9);
    assert.equal(state.participants.length, 26);
  });

  it("should merge partial state updates immutably", () => {
    const current = getInitialGameState();
    const patch: Partial<GameState> = {
      currentRound: 2,
      round2IsOpen: true,
      lastUpdated: 123456789,
    };
    const updated: GameState = {
      ...current,
      ...patch,
    };

    assert.equal(updated.currentRound, 2);
    assert.equal(updated.round2IsOpen, true);
    assert.equal(updated.participants.length, 26);
    assert.equal(updated.lastUpdated, 123456789);
  });

  it("should normalize room codes consistently", () => {
    assert.equal(normalizeRoomCode("1345"), "1345");
    assert.equal(normalizeRoomCode("ROOM-42"), "room-42");
    assert.equal(normalizeRoomCode("  Stage_12!  "), "stage_12");
    assert.equal(normalizeRoomCode(""), "default");
    assert.equal(normalizeRoomCode(null), "default");
    assert.equal(normalizeRoomCode(undefined), "default");
  });

  it("should generate distinct room storage and channel names per room", () => {
    assert.equal(getRoomStorageKey("1345"), "180cr_room_state_1345");
    assert.equal(getRoomBroadcastChannelName("1345"), "180cr_bc_room_1345");
    assert.equal(getRoomRealtimeChannelName("1345"), "room_1345");

    assert.notEqual(getRoomStorageKey("1345"), getRoomStorageKey("9999"));
    assert.notEqual(getRoomRealtimeChannelName("1345"), getRoomRealtimeChannelName("9999"));
  });

  it("should distinguish pure timer countdown ticks from substantive state changes", () => {
    const base = getInitialGameState();
    base.round1TimeRemainingMs = 30000;
    base.round1TimerRunning = true;

    // Pure 100ms decrement should be detected as pure timer tick
    const tickPatch: Partial<GameState> = { round1TimeRemainingMs: 29900 };
    assert.equal(isPureTimerTick(tickPatch, base), true);

    // Starting/stopping the timer is NOT a pure tick (must broadcast)
    const togglePatch: Partial<GameState> = { round1TimerRunning: false };
    assert.equal(isPureTimerTick(togglePatch, base), false);

    // Round change is NOT a pure tick (must broadcast)
    const roundPatch: Partial<GameState> = { currentRound: 2 };
    assert.equal(isPureTimerTick(roundPatch, base), false);

    // Changing timer end timestamp is NOT a pure tick (must broadcast)
    const endAtPatch: Partial<GameState> = { round1TimerEndAt: Date.now() + 30000 };
    assert.equal(isPureTimerTick(endAtPatch, base), false);
  });

  it("should prevent timer jumping back by computing remaining time from timerEndAt", async () => {
    const { sanitizeTimerState } = await import("../lib/supabase.ts");
    const base = getInitialGameState();

    // Simulate timer running with end timestamp 15 seconds in the future
    base.round1TimerRunning = true;
    base.round1TimerEndAt = Date.now() + 15000;
    // An old broadcast arrives containing stale 30000ms
    base.round1TimeRemainingMs = 30000;

    const sanitized = sanitizeTimerState(base);
    // It should compute ~15000ms, NEVER 30000ms!
    assert.ok(sanitized.round1TimeRemainingMs <= 15000);
    assert.ok(sanitized.round1TimeRemainingMs > 14000);
    assert.equal(sanitized.round1TimerRunning, true);
  });

  it("should finish and stop the timer when timerEndAt has passed instead of looping", async () => {
    const { sanitizeTimerState } = await import("../lib/supabase.ts");
    const base = getInitialGameState();

    // Timer ended 500ms ago
    base.round1TimerRunning = true;
    base.round1TimerEndAt = Date.now() - 500;
    base.round1TimeRemainingMs = 30000;

    const sanitized = sanitizeTimerState(base);
    assert.equal(sanitized.round1TimeRemainingMs, 0);
    assert.equal(sanitized.round1TimerRunning, false);
    assert.equal(sanitized.round1TimerEndAt, null);
  });
});
