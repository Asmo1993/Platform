import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("rounded-2xl border bg-white", className)} {...props} />;
});

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
});

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...props },
  ref
) {
  return <h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />;
});
