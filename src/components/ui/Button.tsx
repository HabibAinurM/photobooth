"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
}

const variants: Record<string, string> = {
  primary:
    "bg-merah text-white shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:bg-red-300",
  secondary:
    "bg-white text-merah-tua border-2 border-merah/30 hover:border-merah disabled:opacity-40",
  ghost:
    "bg-transparent text-merah-tua hover:bg-red-50 disabled:opacity-40",
  dark: "bg-malam text-emas border border-emas/40 hover:bg-stone-800 disabled:opacity-40",
};

const sizes: Record<string, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rest["aria-label"]}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
