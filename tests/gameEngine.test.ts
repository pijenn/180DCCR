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
  getNextQuestionState,
  getPrevQuestionState,
  getNextRound1Phase,
  getPrevRound1Phase,
  getParticipantPhoto,
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
  it("should initialize exactly 25 participants with valid local avatars", () => {
    assert.equal(DEFAULT_PARTICIPANTS.length, 25);
    DEFAULT_PARTICIPANTS.forEach((p) => {
      assert.ok(p.id);
      assert.ok(p.name);
      assert.ok(p.university);
      assert.ok(p.avatar);
      assert.match(p.avatar, /^\/participants\/.+/);
      assert.notEqual(p.avatar, "/participants/khal.webp");
      assert.equal(p.score, 0);
    });
  });

  it("should resolve local participant photo by name", () => {
    assert.equal(getParticipantPhoto("Rifqi Syarifuddin Yasykur"), "/participants/Rifqi Syarifuddin (1).png");
    assert.equal(getParticipantPhoto("Mohammad Ali Fikri"), "/participants/Mohammad Ali Fikri.png");
    assert.equal(getParticipantPhoto("Cyka Srihana Humaera"), "/participants/Cyka Humaera.JPG");
    assert.equal(getParticipantPhoto("Faris Audah"), "/participants/Faris Audah.jpeg");
    assert.equal(getParticipantPhoto("Unknown Person"), "/participants/default-avatar.svg");
  });

  it("should sort leaderboard correctly by score descending", () => {
    const participants = [
      { id: "1", name: "Alice", university: "Univ A", score: 50, avatar: "/participants/default-avatar.svg", round2Status: "pending" as const },
      { id: "2", name: "Bob", university: "Univ B", score: 120, avatar: "/participants/default-avatar.svg", round2Status: "pending" as const },
      { id: "3", name: "Charlie", university: "Univ C", score: 90, avatar: "/participants/default-avatar.svg", round2Status: "pending" as const },
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

describe("Game Engine - Round 1 Flow Progression", () => {
  it("should advance through the 5-step flow correctly", () => {
    // 1. Questions & Timer -> 2. Questions, Timer, Options
    assert.equal(getNextRound1Phase("question_timer"), "question_options");
    // 2. Questions, Timer, Options -> 3. Correct Answer
    assert.equal(getNextRound1Phase("question_options"), "correct_answer");
    // 3. Correct Answer -> 4. Leaderboard (only at end of sub-round)
    assert.equal(getNextRound1Phase("correct_answer", true), "leaderboard");
    // 3. Correct Answer -> Next Question directly (mid sub-round)
    assert.equal(getNextRound1Phase("correct_answer", false), "question_timer");
    // 4. Leaderboard -> 5. Next Question / Sub-round (resets to question_timer)
    assert.equal(getNextRound1Phase("leaderboard"), "question_timer");
  });

  it("should track point_gauntlet in Round 1 and point_rootmaster in Round 3", () => {
    const list = [...DEFAULT_PARTICIPANTS];
    const targetId = list[0].id;
    // Round 1 scoring
    const r1Updated = applyScoreChange(list, targetId, 20, 1);
    const p1 = r1Updated.find((p) => p.id === targetId);
    assert.equal(p1?.point_gauntlet, 20);
    assert.equal(p1?.score, 20);

    // Round 3 scoring
    const r3Updated = applyScoreChange(r1Updated, targetId, 50, 3);
    const p3 = r3Updated.find((p) => p.id === targetId);
    assert.equal(p3?.point_gauntlet, 20);
    assert.equal(p3?.point_rootmaster, 50);
    assert.equal(p3?.score, 70);
  });

  it("should reverse through the flow correctly", () => {
    assert.equal(getPrevRound1Phase("leaderboard"), "correct_answer");
    assert.equal(getPrevRound1Phase("correct_answer"), "question_options");
    assert.equal(getPrevRound1Phase("question_options"), "question_timer");
  });

  it("should advance questions and transition between sub-rounds", () => {
    // Sub-round 0 has 3 questions (idx 0, 1, 2)
    const step1 = getNextQuestionState(0, 0);
    assert.equal(step1.subRoundIndex, 0);
    assert.equal(step1.questionIndex, 1);
    assert.equal(step1.isCompleted, false);

    const step2 = getNextQuestionState(0, 1);
    assert.equal(step2.subRoundIndex, 0);
    assert.equal(step2.questionIndex, 2);
    assert.equal(step2.isCompleted, false);

    // End of sub-round 0 -> advance to sub-round 1, question 0
    const step3 = getNextQuestionState(0, 2);
    assert.equal(step3.subRoundIndex, 1);
    assert.equal(step3.questionIndex, 0);
    assert.equal(step3.isCompleted, false);

    // Going backwards
    const prev1 = getPrevQuestionState(1, 0);
    assert.equal(prev1.subRoundIndex, 0);
    assert.equal(prev1.questionIndex, 2);

    const prev2 = getPrevQuestionState(0, 2);
    assert.equal(prev2.subRoundIndex, 0);
    assert.equal(prev2.questionIndex, 1);
  });
});

