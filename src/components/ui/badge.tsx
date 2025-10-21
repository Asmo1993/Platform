import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary";
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "default", ...props },
  ref
) {
  const variantClass =
    variant === "secondary"
      ? "bg-slate-100 text-slate-800"
      : "bg-slate-900 text-white";

  return <span ref={ref} className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs", variantClass, className)} {...props} />;
});
