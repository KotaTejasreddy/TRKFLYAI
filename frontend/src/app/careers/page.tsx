"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { OPEN_ROLES, COMPANY_VALUES } from "@/lib/constants";
import { submitApplication } from "@/lib/api";

const valueIcons: Record<string, React.ReactNode> = {
  lightbulb: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  flag: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  ),
  eye: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  target: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
};

export default function CareersPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    resume_link: "",
    cover_note: "",
  });
  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.role) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setFormState("loading");
    const { error } = await submitApplication(formData);

    if (error) {
      setFormState("error");
      setFormError(
        "Unable to submit your application right now. Please try again later."
      );
    } else {
      setFormState("success");
      setFormData({
        name: "",
        email: "",
        role: "",
        resume_link: "",
        cover_note: "",
      });
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="gradient-text">Build the Future with Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Join a team of world-class engineers solving the hardest problems in
            AI. We offer competitive compensation, meaningful work, and the
            freedom to do your best engineering.
          </motion.p>
        </div>

        {/* Values */}
        <div className="mb-24">
          <SectionHeading
            title="What We Stand For"
            subtitle="Our values shape every decision we make, from product architecture to hiring."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPANY_VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                    {valueIcons[value.icon]}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Roles */}
        <div className="mb-24">
          <SectionHeading
            title="Open Positions"
            subtitle="We're looking for exceptional people who want to build systems that matter."
          />
          <div className="space-y-4 max-w-3xl mx-auto">
            {OPEN_ROLES.map((role, i) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="glass overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedRole(
                        expandedRole === role.id ? null : role.id
                      )
                    }
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {role.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {role.team}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <BriefcaseIcon className="w-4 h-4" />
                          {role.type}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedRole === role.id ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedRole === role.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 border-t border-white/5">
                          <p className="text-gray-400 leading-relaxed mt-4 mb-4">
                            {role.description}
                          </p>
                          <Button
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                role: role.title,
                              }));
                              document
                                .getElementById("apply-form")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }}
                            variant="primary"
                            size="sm"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div id="apply-form" className="max-w-2xl mx-auto">
          <SectionHeading
            title="Apply Now"
            subtitle="Send us your details and we'll get back to you within 48 hours."
          />

          {formState === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 text-center"
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
                Application Submitted
              </h3>
              <p className="text-gray-400">
                Thank you for your interest in joining TRKFLY AI. Our team
                will review your application and reach out soon.
              </p>
              <button
                onClick={() => setFormState("idle")}
                className="mt-6 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Submit another application
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="glass p-6 md:p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
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
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none appearance-none"
                >
                  <option value="" className="bg-gray-900">
                    Select a role
                  </option>
                  {OPEN_ROLES.map((role) => (
                    <option
                      key={role.id}
                      value={role.title}
                      className="bg-gray-900"
                    >
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resume / Portfolio Link
                </label>
                <input
                  type="url"
                  value={formData.resume_link}
                  onChange={(e) =>
                    setFormData({ ...formData, resume_link: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Note
                </label>
                <textarea
                  value={formData.cover_note}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_note: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors outline-none resize-none"
                  placeholder="Tell us about yourself and why you're interested in this role..."
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
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
