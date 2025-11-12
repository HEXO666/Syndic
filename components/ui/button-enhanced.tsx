"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-200",
        destructive:
          "bg-gradient-to-r from-red-600 to-pink-600 text-destructive-foreground shadow-lg hover:shadow-xl hover:scale-105 hover:from-red-700 hover:to-pink-700 active:scale-95 transition-all duration-200",
        success: 
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-emerald-700 hover:to-green-700 active:scale-95 transition-all duration-200",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all duration-200",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-md active:scale-95 transition-all duration-200",
        secondary:
          "bg-gradient-to-r from-slate-200 to-slate-300 text-secondary-foreground shadow-sm hover:shadow-md hover:scale-105 hover:from-slate-300 hover:to-slate-400 active:scale-95 transition-all duration-200",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 transition-all duration-200",
        link: 
          "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95 transition-all duration-200",
        premium:
          "relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl"
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
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {variant === "premium" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {leftIcon && !loading && leftIcon}
        {children}
        {rightIcon && !loading && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }