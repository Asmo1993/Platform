export type DecisionType = "Family" | "Work/Career" | "Hard Situation";

export type RecentItemStatus = "Done" | "In progress" | "No Decision";

export type RecentItem = {
  id: string;
  title: string;
  framework: string;
  status: RecentItemStatus;
  selectedOptionText?: string;
};

export const DECISION_TYPES: DecisionType[] = ["Family", "Work/Career", "Hard Situation"];

export type AnalysisHistoryEntry = {
  ts: number;
  lines: string[];
};
