import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium tracking-wider uppercase",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        gold: "bg-gold-soft text-gold-foreground",
        success: "bg-success/10 text-success",
        outline: "border border-border text-muted-foreground",
        danger: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
