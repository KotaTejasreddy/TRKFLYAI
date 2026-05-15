"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { STATS } from "@/lib/constants";

export default function StatsSection() {
  return (
    <section className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass glow p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat) => (
              <AnimatedCounter
                key={stat.label}
                target={stat.value}
                label={stat.label}
                suffix="+"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
