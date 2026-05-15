"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  size = "md",
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-xl font-medium
    transition-all duration-200 ${sizeClasses[size]}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-indigo-500 to-violet-500 text-white
      hover:from-indigo-400 hover:to-violet-400
      shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
    `,
    secondary: `
      bg-transparent border border-white/20 text-white
      hover:border-white/40 hover:bg-white/5
    `,
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const motionProps = {
    whileHover: disabled ? undefined : { scale: 1.02 },
    whileTap: disabled ? undefined : { scale: 0.98 },
    transition: { duration: 0.15 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={combinedClasses}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </motion.button>
  );
}
