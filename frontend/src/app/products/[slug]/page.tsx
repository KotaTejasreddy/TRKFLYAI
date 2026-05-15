"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  RocketLaunchIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/ui/Badge";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { STATIC_PRODUCTS } from "@/lib/constants";
import { getProductBySlug } from "@/lib/api";
import { Product } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await getProductBySlug(slug);
      if (data && !error) {
        setProduct(data);
      } else {
        const found = STATIC_PRODUCTS.find((p) => p.slug === slug) || null;
        setProduct(found);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-white">Product not found</h1>
        <Button href="/products" variant="secondary">
          Back to Products
        </Button>
      </div>
    );
  }

  const hasLaunchUrl = !!product.launch_url;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Products
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                variant={product.status === "Live" ? "success" : "warning"}
                size="md"
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    product.status === "Live"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
                {product.status}
              </Badge>
              <Badge variant="category" size="md">
                {product.category}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {product.title}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {product.tagline}
            </p>

            {/* Launch App CTA — prominent for products with launch_url */}
            {hasLaunchUrl && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <a
                  href={product.launch_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg
                    bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
                    hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500
                    shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]
                    transition-all duration-300 transform hover:scale-[1.03]"
                >
                  <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  Launch App
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  {/* Glow ring */}
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 blur-xl -z-10 group-hover:blur-2xl transition-all duration-300" />
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* Overview / Description */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <GlassCard hover={false} className="bg-gradient-to-br from-white/5 to-white/[0.02]">
              <p className="text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            </GlassCard>
          </motion.div>

          {/* Problem & Solution — side by side on larger screens */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <GlassCard
              hover={false}
              className="border-l-4 border-l-red-500/50"
            >
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
                The Problem
              </h2>
              <p className="text-gray-300 leading-relaxed">{product.problem}</p>
            </GlassCard>

            <GlassCard
              hover={false}
              className="border-l-4 border-l-emerald-500/50"
            >
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                Our Solution
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {product.solution}
              </p>
            </GlassCard>
          </motion.div>

          {/* Key Features */}
          {product.features && product.features.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/20 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="mt-0.5 w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="text-gray-300 text-sm leading-relaxed">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          )}

          {/* Tech Stack */}
          {product.tech_stack && product.tech_stack.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Tech Stack</h2>
            <div className="flex flex-wrap gap-3">
              {product.tech_stack.map((tech, i) => (
                <motion.span
                  key={tech}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:border-indigo-500/30 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
          )}

          {/* Performance Metrics */}
          {product.metrics && Object.keys(product.metrics).length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(product.metrics).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <GlassCard glow className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-400">{key}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
          )}

          {/* Case Study */}
          {product.case_study && (
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Case Study</h2>
            <GlassCard hover={false} className="bg-indigo-500/5 border-indigo-500/10">
              <p className="text-gray-300 leading-relaxed">
                {product.case_study}
              </p>
            </GlassCard>
          </motion.div>
          )}

          {/* Bottom CTA / Links */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4"
          >
            {hasLaunchUrl && (
              <a
                href={product.launch_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium
                  bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
                  hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500
                  shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]
                  transition-all duration-300 transform hover:scale-[1.02]"
              >
                <RocketLaunchIcon className="w-5 h-5" />
                Launch App
                <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-60" />
              </a>
            )}
            {product.demo_link && (
              <Button href={product.demo_link} variant="primary">
                Live Demo
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </Button>
            )}
            {product.github_link && (
              <Button href={product.github_link} variant="secondary">
                View Source
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>
            )}
            <Button href="/products" variant="secondary">
              <ArrowLeftIcon className="w-4 h-4" />
              All Products
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
