import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "best" | "great" | "good";
}

const borderColors = {
  default: "border-warm-gray-200",
  best: "border-teal ring-2 ring-teal/20",
  great: "border-navy ring-2 ring-navy/20",
  good: "border-warm-gray-400",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl border bg-white p-3 shadow-sm
          ${borderColors[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
