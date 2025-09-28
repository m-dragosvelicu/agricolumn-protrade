import React from "react";
import { cn } from "@/utils";

const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles = {
  default: "bg-yellow-500 text-slate-900 hover:bg-yellow-400 focus-visible:ring-yellow-500",
  outline: "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 focus-visible:ring-slate-500",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-800/70 focus-visible:ring-slate-500",
};

const sizeStyles = {
  default: "h-10 px-4 py-2",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
});
