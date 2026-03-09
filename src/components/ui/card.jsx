import { forwardRef } from "react";
import { cn } from "@/src/lib/utils";

const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-[var(--color-card)] border border-[var(--color-border)]",
      "rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-[family-name:var(--font-family-sans)]", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-[11px] font-semibold tracking-[2px] uppercase",
      "text-[var(--color-text-mute)] font-[family-name:var(--font-family-sans)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
