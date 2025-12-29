"use client";

import React, { forwardRef, ReactNode } from "react";

type Side = "top" | "right" | "bottom" | "left";

type Align = "center" | "start" | "end";

interface TooltipProviderProps {
  children: ReactNode;
}

interface TooltipProps {
  children: ReactNode;
  className?: string;
}

interface TooltipTriggerProps {
  children: ReactNode;
  className?: string;
}

interface TooltipContentProps {
  children: ReactNode;
  side?: Side;
  align?: Align;
  className?: string;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children, className }: TooltipProps) {
  return (
    <div className={`group inline-block relative ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}

export const TooltipTrigger = forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ children, className }, ref) => {
    return (
      <span
        ref={ref}
        tabIndex={0}
        className={`inline-flex items-center ${className ?? ""}`}
      >
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = "top", align = "center", className }, ref) => {
    // Positioning helpers
    const sideClass: Record<Side, string> = {
      top: "-bottom-2 translate-y-[-100%]",
      bottom: "-top-2 translate-y-0",
      left: "right-full mr-2",
      right: "left-full ml-2",
    };

    // Align helpers (center/start/end)
    const alignClass: Record<Align, string> = {
      center: "left-1/2 transform -translate-x-1/2",
      start: "left-0",
      end: "right-0",
    };

    // For top/bottom we use translateY animations; for left/right we use translateX
    const transitionBase =
      "pointer-events-none invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 group-focus-within:visible group-focus-within:opacity-100";

    // Basic styling — feels like shadcn tooltip but simpler
    const baseStyles = `absolute z-50 ${side === "top" || side === "bottom" ? "whitespace-nowrap" : "w-auto"}`;

    return (
      <div
        ref={ref}
        role="tooltip"
        className={`${baseStyles} ${sideClass[side]} ${alignClass[align]} ${transitionBase} ${className ?? ""}`}
        // keep it off-screen for screen readers until shown
        aria-hidden={true}
      >
        <div className="rounded-md bg-gray-900 text-white text-xs px-3 py-1.5 shadow-lg">
          {children}
        </div>
        {/* little arrow */}
        <div
          className={`absolute ${
            side === "top"
              ? "-bottom-1 left-1/2 transform -translate-x-1/2 rotate-45"
              : side === "bottom"
              ? "-top-1 left-1/2 transform -translate-x-1/2 rotate-45"
              : side === "left"
              ? "right-1 top-1/2 transform -translate-y-1/2 rotate-45"
              : "left-1 top-1/2 transform -translate-y-1/2 rotate-45"
          } w-3 h-3 bg-gray-900 pointer-events-none hidden group-hover:block`}
        />
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export default Tooltip;
