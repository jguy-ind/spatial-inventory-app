"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
  position?: "edge" | "inline";
}

/**
 * IconToggle Component
 * 
 * A reusable toggle button for collapsing/expanding navigation sidebars.
 * Follows UX best practices with consistent positioning and clear visual feedback.
 * 
 * @param isCollapsed - Current collapsed state
 * @param onToggle - Callback when toggle is clicked
 * @param position - "edge" positions at sidebar border, "inline" renders inline
 * @param className - Additional CSS classes
 */
export function IconToggle({ 
  isCollapsed, 
  onToggle, 
  className,
  position = "edge" 
}: IconToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
      className={cn(
        "flex items-center justify-center rounded-full bg-white border border-slate-200 transition-all",
        "hover:bg-slate-50 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        position === "edge" && "absolute -right-3 top-6 z-10 w-6 h-6 shadow-sm",
        position === "inline" && "w-8 h-8",
        className
      )}
    >
      {isCollapsed ? (
        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
      ) : (
        <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
      )}
    </button>
  );
}
