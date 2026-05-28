"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon, FireIcon, BoltIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { useXp } from "@/lib/useXp";
import { getLevel, getXpToNextLevel } from "@/lib/xp";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, access, logout } = useAuth();
  const xpState = useXp();
  const level = getLevel(xpState.xp);
  const { current: xpInLevel, needed: xpNeeded } = getXpToNextLevel(xpState.xp);
  const xpPct = (xpInLevel / xpNeeded) * 100;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: scrolled ? "var(--navbar-bg)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_16px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_24px_rgba(99,102,241,0.6)] transition-shadow">
                T
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-base font-bold tracking-tight">
                <span className="gradient-text">{SITE.name}</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                    className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 hover:opacity-100"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                        className="absolute inset-0 rounded-lg"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* XP / streak chip — only render when user has any activity */}
              {(xpState.xp > 0 || xpState.streakDays > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  title={`Level ${level} · ${xpState.xp} XP · ${xpState.streakDays}-day streak`}
                >
                  {xpState.streakDays > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-400">
                      <FireIcon className="w-3.5 h-3.5" />
                      {xpState.streakDays}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <BoltIcon className="w-3.5 h-3.5" />
                    Lv {level}
                  </span>
                  {/* XP bar */}
                  <div className="relative w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <motion.div
                      key={xpState.xp}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Auth / user state */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div
                    title={access ? `${access.plan} · ${access.days_left}d left` : user.email}
                    className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {(user.handle?.[0] || user.email[0]).toUpperCase()}
                    </span>
                    <span className="font-semibold truncate max-w-[100px]" style={{ color: "var(--text)" }}>
                      {user.handle || user.email.split("@")[0]}
                    </span>
                    {access?.plan === "trial" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                        TRIAL {access.days_left}d
                      </span>
                    )}
                    {access && access.plan !== "trial" && access.plan !== "none" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 uppercase">
                        {access.plan}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-2 rounded-lg transition-colors hover:border-red-500/40"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile right */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ color: "var(--text-secondary)" }}
                className="p-2 hover:opacity-80 transition-opacity"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              style={{ background: "var(--navbar-bg)", borderLeft: "1px solid var(--border)" }}
              className="absolute right-0 top-0 bottom-0 w-72 backdrop-blur-2xl p-6 pt-24"
            >
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <Link
                        href={link.href}
                        style={isActive
                          ? { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }
                          : { color: "var(--text-secondary)" }
                        }
                        className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-100"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: NAV_LINKS.length * 0.06 }} className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link href="/learn" className="block px-4 py-3 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                    Start Learning
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
