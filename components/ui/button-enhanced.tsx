"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-white border-transparent hover:bg-black",
        destructive:
          "bg-[var(--bad)] text-white border-transparent hover:opacity-90",
        success:
          "bg-[var(--good)] text-white border-transparent hover:opacity-90",
        warning:
          "bg-[var(--warn)] text-white border-transparent hover:opacity-90",
        outline:
          "border border-[var(--line)] bg-[var(--card)] text-[var(--ink-2)] hover:bg-[var(--surface-2)]",
        secondary:
          "bg-[var(--surface-2)] text-[var(--ink-2)] border-transparent hover:bg-[var(--line)]",
        ghost:
          "bg-transparent text-[var(--ink-2)] border-transparent hover:bg-[var(--surface-2)]",
        link:
          "bg-transparent text-[var(--accent-blue-ink)] underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-[32px] px-3 py-0",
        sm:      "h-[28px] px-2.5 text-xs rounded-[6px]",
        lg:      "h-[38px] px-5 text-sm",
        icon:    "h-[30px] w-[30px]",
        "icon-sm": "h-[26px] w-[26px] rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, ...props }, ref) => {
    if (asChild) {
      // Slot requires exactly one child — pass only children, no extras.
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
