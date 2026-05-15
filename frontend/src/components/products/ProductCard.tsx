"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Product } from "@/types";
import Badge from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const categoryColors: Record<string, string> = {
  "AI/ML": "category",
  Platform: "info",
  Infrastructure: "default",
  Security: "warning",
  "Developer Tools": "success",
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Badge
              variant={
                (categoryColors[product.category] as
                  | "category"
                  | "info"
                  | "default"
                  | "warning"
                  | "success") || "default"
              }
            >
              {product.category}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.status === "Live"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
              <span className="text-xs text-gray-400">{product.status}</span>
            </div>
          </div>

          {/* Title & Tagline */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
            {product.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
            {product.tagline}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-gray-300 border border-white/5"
              >
                {tech}
              </span>
            ))}
            {product.tech_stack.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-gray-500">
                +{product.tech_stack.length - 4}
              </span>
            )}
          </div>

          {/* Metrics */}
          <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
            {Object.entries(product.metrics)
              .slice(0, 2)
              .map(([key, value]) => (
                <div key={key}>
                  <div className="text-xs text-gray-500 mb-0.5">{key}</div>
                  <div className="text-sm font-semibold text-white">
                    {value}
                  </div>
                </div>
              ))}
          </div>

          {/* Arrow */}
          <div className="mt-4 flex items-center text-sm text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View case study
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
