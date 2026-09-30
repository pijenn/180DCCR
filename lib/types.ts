export type Round2Status = "pending" | "passed" | "failed";
export type ParticipantStatus = "active" | "eliminated" | "golden_ticket";

export interface PressureRubric {
  problemStructuring?: number; // max 30
  originality?: number;        // max 20
  adaptability?: number;       // max 20
  deckQuality?: number;        // max 15
  executivePresence?: number;  // max 15
}

export interface Participant {
  id: string;
  name: string;
  university: string;
  avatar: string;
  score: number;
  round2Status: Round2Status;
  isGoldenTicket?: boolean;
  golden_ticket?: boolean;
  status?: ParticipantStatus;
  eliminatedInRound?: number | null;
  roundScores?: Record<number, number>;
  point_gauntlet?: number;
  point_rootmaster?: number;
  pressureRubric?: PressureRubric;
}

export interface PlayerRecord {
  name: string;
  point_gauntlet: number;
  point_rootmaster: number;
  golden_pass?: boolean;
  golden_ticket?: boolean;
  isGoldenTicket?: boolean;
  eliminated: boolean;
  university?: string;
  avatar?: string;
  round2_status?: string;
  eliminated_in_round?: number | null;
}

export interface SubRoundConfig {
  id: number;
  name: string;
  points: number;
  questionCount: number;
}

export interface Question {
  id: string;
  roundId: number;
  subRoundId: number;
  questionNumber: number;
  prompt: string;
  imageUrl?: string;
  options: {
    key: "A" | "B" | "C" | "D" | "E" | "F";
    text: string;
  }[];
  correctAnswer?: string;
}

export type Round1Phase =
  | "question_timer"
  | "question_options"
  | "correct_answer"
  | "leaderboard"
  | "idle"
  | "preview"
  | "answering";

export interface GameState {
  currentRound: number; // 1 to 6
  // Round 1 state
  subRoundIndex: number; // 0 to 7
  questionIndex: number; // 0 to questionCount - 1
  round1Phase: Round1Phase;
  round1TimeRemainingMs: number; // in ms
  round1TimerRunning: boolean;
  round1TimerEndAt?: number | null;

  // Round 2 state (Capital Conquest)
  round2TargetAnswer: number;
  round2IsOpen: boolean;

  // Round 3 state (Rootmaster)
  round3TimeRemainingMs: number;
  round3TimerRunning: boolean;
  round3InitialMs: number;
  round3TimerEndAt?: number | null;

  // Round 4 state (Sacred Handoff)
  round4TimeRemainingMs: number;
  round4TimerRunning: boolean;
  round4SpinNames?: string[];
  round4SelectedWinner?: string | null;
  round4TimerEndAt?: number | null;

  // Round 5 state (Pressure Chamber)
  round5SpinNames: string[];
  round5SelectedWinner: string | null;
  round5TimeRemainingMs: number;
  round5TimerRunning: boolean;
  round5GameEnded?: boolean;
  round5TimerEndAt?: number | null;
  round5ShowLeaderboard?: boolean;
  round5SpunWinners?: string[];

  // Round 6 state (Executive Pitch)
  round6SpinNames?: string[];
  round6SelectedWinner?: string | null;
  round6TimeRemainingMs?: number;
  round6TimerRunning?: boolean;
  round6GameEnded?: boolean;
  round6TimerEndAt?: number | null;
  round6ShowLeaderboard?: boolean;
  round6SpunWinners?: string[];

  // Participants map or list
  participants: Participant[];

  // General audio & settings
  soundEnabled: boolean;
  lastUpdated: number;
}

