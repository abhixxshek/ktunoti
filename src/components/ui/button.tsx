import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-[#E94359]/30 focus-visible:border-[#E94359]",
  {
    variants: {
      variant: {
        default:
          "bg-[#E94359] text-white hover:bg-[#D83248] shadow-sm active:scale-[0.98] border border-transparent",
        primary:
          "bg-[#E94359] text-white hover:bg-[#D83248] shadow-sm active:scale-[0.98] border border-transparent",
        secondary:
          "bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 active:scale-[0.98] border border-transparent",
        outline:
          "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] shadow-xs",
        ghost:
          "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-[0.98] border border-transparent",
        subtle:
          "bg-[#FDF2F4] text-[#E94359] hover:bg-[#FCE7EB] border border-[#E94359]/20 active:scale-[0.98]",
        destructive:
          "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 active:scale-[0.98]",
        link:
          "text-[#E94359] underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-10 px-4 text-sm gap-2 [&_svg]:size-4",
        sm: "h-8 px-3 text-[13px] gap-1.5 [&_svg]:size-3.5",
        lg: "h-12 px-5 text-[15px] gap-2.5 [&_svg]:size-5",
        icon: "size-10 p-0 [&_svg]:size-4",
        "icon-sm": "size-8 p-0 [&_svg]:size-3.5",
        "icon-lg": "size-12 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  className?: string
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
