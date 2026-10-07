"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer no-underline",
  {
    variants: {
      variant: {
        default: "bg-primary text-[#111] hover:bg-primary/90",
        secondary:
          "border border-border bg-transparent text-foreground hover:border-primary hover:text-primary",
        ghost: "border border-border bg-transparent text-foreground hover:bg-card",
        destructive: "bg-destructive text-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        arena:
          "bg-primary text-[#111] font-display text-xl tracking-[0.06em] hover:bg-primary/90 hover:text-[#111]",
        arenaGhost:
          "border border-border bg-transparent text-foreground font-display text-xl tracking-[0.06em] hover:border-primary hover:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6",
        xl: "h-auto px-5 py-3.5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
