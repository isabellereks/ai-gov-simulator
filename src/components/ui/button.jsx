import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "font-semibold",
    "cursor-pointer select-none",
    "transition-all duration-[200ms] ease-[var(--ease-out)]",
    "gs-interactive gs-focus-ring",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--color-bar)] text-[var(--color-bg)]",
          "border-none rounded-[var(--radius-md)]",
          "gs-btn-primary",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--color-text-mid)]",
          "border border-[var(--color-border)] rounded-[var(--radius-md)]",
          "gs-btn-ghost",
        ].join(" "),
        bar: [
          "bg-transparent text-[var(--color-bar-fill)]",
          "border border-[var(--color-bar-mute)] rounded-[var(--radius-sm)]",
          "gs-bar-control",
        ].join(" "),
      },
      size: {
        sm: "px-3 py-1.5 text-[11px]",
        md: "px-5 py-2 text-[12px]",
        lg: "px-7 py-2.5 text-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { style, ...rest } = props;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", ...style }}
        {...rest}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
