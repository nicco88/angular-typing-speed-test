import data from "../data.json"

export type Difficulty = keyof typeof data;

export type Mode = "TIMED" | "PASSAGE";

export interface CharState {
  value: string;
  state: "PENDING" | "CORRECT" | "INCORRECT";
  historicalError: boolean;
}

