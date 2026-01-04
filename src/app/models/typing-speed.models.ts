import data from "../data.json"

export type Difficulty = keyof typeof data;

export type Mode = "TIMED" | "PASSAGE";

export interface CharState {
  value: string;
  state: "PENDING" | "CORRECT" | "INCORRECT";
  historicalError: boolean;
}

export interface DifficultyOption {
  label: "Easy" | "Medium" | "Hard";
  value: Difficulty;
  id: Difficulty;
}

export interface ModeOption {
  label: "Timed (60s)" | "Passage";
  value: Mode;
  id: "timed" | "passage";
}

