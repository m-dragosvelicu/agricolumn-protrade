import React from "react";
import { cn } from "@/utils";

export function Table({ className, ...props }) {
  return (
    <table
      className={cn("w-full caption-bottom text-sm text-left text-slate-300", className)}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-slate-800/40", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-slate-800", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("transition-colors", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("px-4 py-3 align-middle", className)}
      {...props}
    />
  );
}
