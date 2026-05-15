"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { STATIC_PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { getProducts } from "@/lib/api";
import { Product } from "@/types";

/** Slugs of products to feature at the very top of the grid, in this order. */
const FEATURED_SLUGS = ["pulseai", "ai-digital-twin", "omniscience-ds", "helios-bi"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await getProducts();
      if (data && !error) {
        // Backend returns { success, data: Product[], count }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbList: Product[] = Array.isArray(data) ? data : (data as any).data;
        if (Array.isArray(dbList)) {
          // Merge: STATIC always wins for slugs we author here, plus any DB-only extras.
          const staticSlugs = new Set(STATIC_PRODUCTS.map((p) => p.slug));
          const dbOnly = dbList.filter((p) => !staticSlugs.has(p.slug));
          setProducts([...STATIC_PRODUCTS, ...dbOnly]);
        }
      }
    }
    fetchProducts();
  }, []);

  // Sort: featured slugs first (in their defined order), then by category/title.
  const ordered = useMemo(() => {
    const rank = (slug: string) => {
      const i = FEATURED_SLUGS.indexOf(slug);
      return i === -1 ? 999 : i;
    };
    return [...products].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [products]);

  const filtered =
    activeCategory === "All"
      ? ordered
      : ordered.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Products"
          subtitle="Every product is built to solve a specific, high-impact problem. From model training to infrastructure management, we engineer solutions at production scale."
        />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {PRODUCT_CATEGORIES.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg">
              No products found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
