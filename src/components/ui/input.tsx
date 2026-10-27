import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, endIcon, ...props }, ref) => {
    if (icon || endIcon) {
      return (
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              endIcon && "pr-11",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3.5 flex items-center">
              {endIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
