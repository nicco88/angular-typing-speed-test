import { DifficultyOption, ModeOption } from "../../models/typing-speed.models";

export const difficultyOptions: DifficultyOption[] = [
  { label: "Easy", value: "easy", id: "easy" },
  { label: "Medium", value: "medium", id: "medium" },
  { label: "Hard", value: "hard", id: "hard" },
] as const;

export const modeOptions: ModeOption[] = [
  { label: "Timed (60s)", value: "TIMED", id: "timed" },
  { label: "Passage", value: "PASSAGE", id: "passage" },
] as const;
