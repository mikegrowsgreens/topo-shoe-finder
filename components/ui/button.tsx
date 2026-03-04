import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-teal hover:bg-teal-dark text-white shadow-sm",
  secondary: "bg-navy hover:bg-navy/90 text-white shadow-sm",
  outline: "border-2 border-teal text-teal hover:bg-teal hover:text-white",
  ghost: "text-warm-gray-600 hover:bg-warm-gray-100",
};

const sizeStyles = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-lg font-semibold
          transition-colors duration-200 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2
          disabled:pointer-events-none disabled:opacity-50
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
