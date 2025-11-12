"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const inputVariants = cva(
  "flex w-full border border-input bg-background text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "rounded-xl px-4 py-3 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:border-primary/50",
        modern: "rounded-2xl px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:bg-white dark:hover:bg-slate-800/50",
        glass: "rounded-2xl px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/30 dark:border-slate-700/30 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-400",
        floating: "rounded-xl px-4 pt-6 pb-2 bg-background border-2 border-slate-200 dark:border-slate-700 focus-within:border-blue-500 peer-placeholder-shown:pt-4 peer-placeholder-shown:pb-4",
      },
      size: {
        default: "h-10",
        sm: "h-8 text-xs px-3",
        lg: "h-14 px-6 text-base",
        xl: "h-16 px-8 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  error?: string
  success?: boolean
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, leftIcon, rightIcon, label, error, success, loading, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const isPassword = type === "password"

    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="space-y-2">
        {label && (
          <label className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
            error ? "text-red-600 dark:text-red-400" : success ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
          )}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant, size }),
              leftIcon && "pl-10",
              (rightIcon || isPassword || loading) && "pr-10",
              error && "border-red-300 dark:border-red-600 focus-visible:ring-red-500",
              success && "border-emerald-300 dark:border-emerald-600 focus-visible:ring-emerald-500",
              isFocused && "ring-2 ring-blue-500/20 border-blue-400",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {isPassword && !loading && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && !loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
            Valide
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="space-y-2">
        {label && (
          <label className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
            error ? "text-red-600 dark:text-red-400" : success ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
          )}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-2xl border border-input bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-red-300 dark:border-red-600 focus-visible:ring-red-500",
            success && "border-emerald-300 dark:border-emerald-600 focus-visible:ring-emerald-500",
            isFocused && "ring-2 ring-blue-500/20 border-blue-400",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
            Valide
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, Textarea, inputVariants }