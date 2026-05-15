"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { submitContact } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setFormState("loading");
    const { error } = await submitContact(formData);

    if (error) {
      setFormState("error");
      setFormError(
        "Unable to send your message right now. Please try again later."
      );
    } else {
      setFormState("success");
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="pt-24 pb-16 relative">
      {/* Background elements */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="gradient-text">Get in Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Have a question about our products, want to discuss a partnership, or
            just want to say hello? We would love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            {formState === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 text-center h-full flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Message Sent
                </h3>
                <p className="text-gray-400 mb-6">
                  Thank you for reaching out. Our team will get back to you
                  within 24 hours.
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none"
                    placeholder="example@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm"
                  >
                    {formError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={formState === "loading"}
                  className="w-full"
                >
                  {formState === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            <GlassCard hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <p className="text-gray-400 text-sm">hello@TRKFLY.ai</p>
                  <p className="text-gray-400 text-sm">
                    enterprise@TRKFLY.ai
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Headquarters
                  </h3>
                  <p className="text-gray-400 text-sm">Hyderabad, Telangana</p>
                  <p className="text-gray-400 text-sm">India</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <GlobeAltIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Social</h3>
                  <div className="space-y-1">
                    {["GitHub", "Twitter", "LinkedIn", "Discord"].map(
                      (social) => (
                        <a
                          key={social}
                          href="#"
                          className="block text-gray-400 text-sm hover:text-indigo-400 transition-colors"
                        >
                          {social}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="glass p-6 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
              <h3 className="text-white font-semibold mb-2">
                Enterprise Inquiries
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                For enterprise licensing, custom deployments, and dedicated
                support, reach out to our enterprise team for a tailored
                solution.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
