import React from "react";
import { cn } from "@/utils";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[24px] items-center rounded-full border border-slate-600 bg-slate-700/60 px-3 text-xs font-medium uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}
