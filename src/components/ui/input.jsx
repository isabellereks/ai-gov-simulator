import { forwardRef } from "react";
import { cn } from "@/src/lib/utils";

const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex-1 min-w-0",
      "bg-[var(--color-card-alt)] text-[var(--color-text)]",
      "border border-[var(--color-border)] rounded-[var(--radius-md)]",
      "font-[family-name:var(--font-family-serif)]",
      "outline-none",
      "transition-[border-color] duration-[150ms] ease-[var(--ease-out)]",
      "gs-input gs-focus-ring",
      "placeholder:text-[var(--color-text-mute)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
