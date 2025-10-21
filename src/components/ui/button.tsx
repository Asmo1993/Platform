import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "secondary" | "ghost";
type Size = "default" | "sm";

const variantStyles: Record<Variant, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-200 hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "hover:bg-slate-50"
};

const sizeStyles: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3"
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
});
