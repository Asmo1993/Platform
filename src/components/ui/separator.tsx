import * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("h-px w-full bg-slate-200", className)} {...props} />;
});
