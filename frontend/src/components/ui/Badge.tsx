"use client";

import { motion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "category";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  default: "bg-white/10 text-gray-300 border-white/10",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  category: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center border rounded-full font-medium
        ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
