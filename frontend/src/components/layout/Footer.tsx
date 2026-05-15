"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SITE, STATIC_PRODUCTS } from "@/lib/constants";

const footerLinks = {
  Products: STATIC_PRODUCTS.slice(0, 4).map((p) => ({
    label: p.title,
    href: `/products/${p.slug}`,
  })),
  Company: [
    { label: "About", href: "/" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "#" },
  ],
  Connect: [
    { label: "GitHub", href: "https://github.com/tejasreddy1817" },
    { label: "Instagram", href: "https://www.instagram.com/teja_reddy_kota?igsh=OWo2ejMyajhka2xr" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/kota-teja-reddy-417495255/" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                T
              </div>
              <span className="text-lg font-bold gradient-text">
                {SITE.name}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {SITE.description}
            </p>
            <div className="flex gap-4">
              {[
                { label: "GitHub", href: "https://github.com/tejasreddy1817", icon: "G" },
                { label: "Instagram", href: "https://www.instagram.com/teja_reddy_kota?igsh=OWo2ejMyajhka2xr", icon: "I" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/kota-teja-reddy-417495255/", icon: "L" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs font-medium"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            >
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
