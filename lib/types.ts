export type Round2Status = "pending" | "passed" | "failed";

export interface Participant {
  id: string;
  name: string;
  university: string;
  avatar: string;
  score: number;
  round2Status: Round2Status;
  roundScores?: Record<number, number>;
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
  options: {
    key: "A" | "B" | "C" | "D" | "E" | "F";
    text: string;
  }[];
  correctAnswer?: string;
}

export interface GameState {
  currentRound: number; // 1 to 5
  // Round 1 state
  subRoundIndex: number; // 0 to 7
  questionIndex: number; // 0 to questionCount - 1
  round1Phase: "preview" | "answering" | "idle";
  round1TimeRemainingMs: number; // in ms
  round1TimerRunning: boolean;

  // Round 2 state
  round2TargetAnswer: number;
  round2IsOpen: boolean;

  // Round 3 state (Rootmaster)
  round3TimeRemainingMs: number;
  round3TimerRunning: boolean;
  round3InitialMs: number;

  // Round 4 state (Pressure Chamber)
  round4SpinNames: string[];
  round4SelectedWinner: string | null;
  round4TimeRemainingMs: number;
  round4TimerRunning: boolean;

  // Round 5 state (Executive Pitch)
  round5SpinNames: string[];
  round5SelectedWinner: string | null;
  round5TimeRemainingMs: number;
  round5TimerRunning: boolean;
  round5GameEnded: boolean;

  // Participants map or list
  participants: Participant[];

  // General audio & settings
  soundEnabled: boolean;
  lastUpdated: number;
}
