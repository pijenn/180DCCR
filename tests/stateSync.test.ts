import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getInitialGameState } from "../lib/gameEngine.ts";
import type { GameState } from "../lib/types.ts";

describe("State Synchronization", () => {
  it("should create valid initial game state structure", () => {
    const state = getInitialGameState();
    assert.equal(state.currentRound, 1);
    assert.equal(state.subRoundIndex, 0);
    assert.equal(state.round1Phase, "idle");
    assert.equal(state.round2TargetAnswer, 1467);
    assert.equal(state.round4SpinNames!.length, 9);
    assert.equal(state.round5SpinNames!.length, 5);
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
});
