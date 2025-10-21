import { RecentItem } from "../types";

export const RECENT_INITIAL: RecentItem[] = [
  { id: "DEC-3289", title: "Hire Senior Engineer?", framework: "Matrix", status: "Done" },
  { id: "DEC-3294", title: "Move GTM budget to paid social?", framework: "Quadrant", status: "In progress" },
  { id: "DEC-3311", title: "Relocate to Dubai?", framework: "Tree", status: "No Decision" },
  { id: "DEC-3332", title: "Start newsletter?", framework: "Premortem", status: "Done" }
];

export const TIPS = [
  "Keep it under 3 minutes for best results.",
  "Be specific about constraints (time, budget).",
  "Add at least 2 options to compare meaningfully.",
  "Note your biggest fear—AI will help de-bias."
];

export const COLORS = ["#10B981", "#6366F1", "#F59E0B"] as const;
