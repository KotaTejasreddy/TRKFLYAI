"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/products/ProductCard";
import Button from "@/components/ui/Button";
import { STATIC_PRODUCTS } from "@/lib/constants";

export default function FeaturedProducts() {
  const featured = STATIC_PRODUCTS.slice(0, 3);

  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Products"
          subtitle="Production-grade AI systems trusted by engineering teams worldwide. Each product is designed to solve a specific, high-impact problem."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button href="/products" variant="secondary">
            View All Products
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
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
