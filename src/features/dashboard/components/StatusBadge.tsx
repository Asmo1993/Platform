import { RecentItemStatus } from "../types";
import { cn } from "@/lib/utils";

type Props = {
  status: RecentItemStatus;
};

const STATUS_VARIANTS: Record<RecentItemStatus, string> = {
  Done: "bg-emerald-100 text-emerald-700",
  "In progress": "bg-indigo-100 text-indigo-700",
  "No Decision": "bg-amber-100 text-amber-800"
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        STATUS_VARIANTS[status]
      )}
    >
      {status}
    </span>
  );
}
