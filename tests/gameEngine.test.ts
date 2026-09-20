import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ROUND_1_SUBROUNDS,
  DEFAULT_PARTICIPANTS,
  calculateLeaderboard,
  validateRound2Answer,
  formatTimerDisplay,
  formatPrecisionCountdown,
  getSubRoundPointValue,
  applyScoreChange,
  searchParticipants,
} from "../lib/gameEngine.ts";

describe("Game Engine - Round 1: The Gauntlet", () => {
  it("should have exactly 8 sub-rounds with correct points and question counts", () => {
    assert.equal(ROUND_1_SUBROUNDS.length, 8);

    const expected = [
      { name: "BUSINESS ANALYST", points: 20, questionCount: 3 },
      { name: "ASSOCIATE CONSULTANT", points: 30, questionCount: 3 },
      { name: "CONSULTANT", points: 45, questionCount: 3 },
      { name: "SENIOR CONSULTANT", points: 65, questionCount: 3 },
      { name: "MANAGER", points: 90, questionCount: 3 },
      { name: "PRINCIPAL", points: 120, questionCount: 3 },
      { name: "CRISIS ROUND", points: 130, questionCount: 1 },
      { name: "PARTNER", points: 170, questionCount: 3 },
    ];

    expected.forEach((exp, idx) => {
      assert.equal(ROUND_1_SUBROUNDS[idx].name, exp.name);
      assert.equal(ROUND_1_SUBROUNDS[idx].points, exp.points);
      assert.equal(ROUND_1_SUBROUNDS[idx].questionCount, exp.questionCount);
    });
  });

  it("should return correct point values for sub-round lookups", () => {
    assert.equal(getSubRoundPointValue(0), 20);
    assert.equal(getSubRoundPointValue(6), 130);
    assert.equal(getSubRoundPointValue(7), 170);
  });
});

describe("Game Engine - Participants & Leaderboard", () => {
  it("should initialize exactly 26 participants with default khal avatar", () => {
    assert.equal(DEFAULT_PARTICIPANTS.length, 26);
    DEFAULT_PARTICIPANTS.forEach((p) => {
      assert.ok(p.id);
      assert.ok(p.name);
      assert.ok(p.university);
      assert.equal(p.avatar, "/participants/khal.webp");
      assert.equal(p.score, 0);
    });
  });

  it("should sort leaderboard correctly by score descending", () => {
    const participants = [
      { id: "1", name: "Alice", university: "Univ A", score: 50, avatar: "/participants/khal.webp", round2Status: "pending" as const },
      { id: "2", name: "Bob", university: "Univ B", score: 120, avatar: "/participants/khal.webp", round2Status: "pending" as const },
      { id: "3", name: "Charlie", university: "Univ C", score: 90, avatar: "/participants/khal.webp", round2Status: "pending" as const },
    ];

    const ranked = calculateLeaderboard(participants);
    assert.equal(ranked[0].name, "Bob");
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[1].name, "Charlie");
    assert.equal(ranked[1].rank, 2);
    assert.equal(ranked[2].name, "Alice");
    assert.equal(ranked[2].rank, 3);
  });
});

describe("Game Engine - Round 2: Capital Conquest", () => {
  it("should validate integer answers correctly", () => {
    assert.equal(validateRound2Answer(1467, 1467), true);
    assert.equal(validateRound2Answer("1467", 1467), true);
    assert.equal(validateRound2Answer(" 1467 ", 1467), true);
    assert.equal(validateRound2Answer(999, 1467), false);
    assert.equal(validateRound2Answer("wrong", 1467), false);
  });
});

describe("Game Engine - Timer Formatting", () => {
  it("should format second:millisecond for 30s timers (e.g. 29:59)", () => {
    assert.equal(formatTimerDisplay(29590), "29:59");
    assert.equal(formatTimerDisplay(5420), "05:42");
    assert.equal(formatTimerDisplay(0), "00:00");
  });

  it("should format precision countdown for Rootmaster (Mins:Second:MilSec)", () => {
    // 5 minutes, 3 seconds, 450 milliseconds = 303450 ms
    assert.equal(formatPrecisionCountdown(303450), "05:03:45");
    assert.equal(formatPrecisionCountdown(0), "00:00:00");
  });
});

describe("Game Engine - Score Mutation & Search", () => {
  it("should update participant score and prevent negative score", () => {
    const list = [...DEFAULT_PARTICIPANTS];
    const targetId = list[0].id;
    const updated = applyScoreChange(list, targetId, 45);
    assert.equal(updated.find((p) => p.id === targetId)?.score, 45);

    const decremented = applyScoreChange(updated, targetId, -100);
    assert.equal(decremented.find((p) => p.id === targetId)?.score, 0); // clamp to 0 minimum
  });

  it("should filter participants instantly by name or university case-insensitively", () => {
    const results = searchParticipants(DEFAULT_PARTICIPANTS, "brawijaya");
    assert.ok(results.length > 0);
    results.forEach((p) => {
      const match = p.university.toLowerCase().includes("brawijaya") || p.name.toLowerCase().includes("brawijaya");
      assert.ok(match);
    });

    const specificName = searchParticipants(DEFAULT_PARTICIPANTS, "rifqi");
    assert.equal(specificName.length, 1);
    assert.equal(specificName[0].name, "Rifqi Syarifuddin Yasykur");
  });
});
