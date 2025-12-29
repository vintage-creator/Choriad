// components/Logo.tsx
import React from "react";

export function Logo({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${className}`}
      aria-hidden={false}
      role="img"
      aria-label="choriad — home"
    >
      <svg
        viewBox={compact ? "0 0 36 36" : "0 0 360 64"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto block"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        <g transform={compact ? "translate(0,0)" : "translate(8,16)"}>
          <circle
            cx={compact ? 18 : 18}
            cy={compact ? 18 : 18}
            r={compact ? 16 : 16}
            fill="url(#logoGrad)"
          />
          <path
            d="M10 18c0-4.418 3.582-8 8-8"
            stroke="#ffffff"
            strokeWidth={compact ? 2.8 : 3.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={compact ? "translate(0,0)" : "translate(0,0)"}
          />
        </g>

        {/* Wordmark */}
        {!compact && (
          <g transform="translate(48,44)">
            {/* Use 'currentColor' so Tailwind text color controls it */}
            <text
              x="0"
              y="0"
              fill="currentColor"
              fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
              fontWeight="700"
              fontSize="28"
              style={{ letterSpacing: "-0.02em" }}
            >
              choriad
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
