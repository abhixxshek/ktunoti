import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors border",
  {
    variants: {
      variant: {
        default:
          "bg-[#FDF2F4] text-[#E94359] border-[#F8C6CD]",
        secondary:
          "bg-neutral-100 text-neutral-700 border-neutral-200/80",
        success:
          "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200/80",
        outline:
          "bg-white text-neutral-600 border-neutral-200",
        neutral:
          "bg-neutral-900 text-white border-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
