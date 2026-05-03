"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "bg-[var(--card)] border border-[var(--line)] text-[var(--foreground)]",
  {
    variants: {
      variant: {
        default:     "rounded-[14px] shadow-[var(--shadow-sm)]",
        elevated:    "rounded-[14px] shadow-[var(--shadow-md)] hover:shadow-lg transition-shadow",
        glass:       "rounded-[14px] shadow-[var(--shadow-sm)]",
        gradient:    "rounded-[14px] shadow-[var(--shadow-sm)]",
        premium:     "rounded-[14px] shadow-[var(--shadow-md)]",
        interactive: "rounded-[14px] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--ink-4)] transition-all cursor-pointer",
      },
      padding: {
        default: "",
        none:    "p-0",
        sm:      "p-4",
        md:      "p-6",
        lg:      "p-8",
        xl:      "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-[14px_18px_10px]", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight text-sm", className)}
      style={{ fontFamily: "var(--font-inter-tight), sans-serif", fontSize: 14, letterSpacing: "-0.01em" }}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-[11.5px] text-[var(--ink-3)] mt-0.5", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-[0_18px_14px]", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-[0_18px_14px]", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
