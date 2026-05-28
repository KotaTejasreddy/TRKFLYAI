"use client";

import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import ConceptSection from "@/components/learn/concepts/ConceptSection";
import TokenizationDemo from "@/components/learn/concepts/TokenizationDemo";
import EmbeddingsDemo from "@/components/learn/concepts/EmbeddingsDemo";
import AttentionDemo from "@/components/learn/concepts/AttentionDemo";
import AuroraBg from "@/components/learn/AuroraBg";

export default function InsideLLMPage() {
  return (
    <div className="relative">
      {/* Aurora background — fixed so it follows scroll */}
      <div className="fixed inset-0 -z-10">
        <AuroraBg />
      </div>

      {/* Sticky top bar */}
      <div className="sticky top-16 z-20 backdrop-blur-xl border-b"
        style={{
          background: "rgba(3,3,10,0.55)",
          borderColor: "rgba(34,211,238,0.10)",
        }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/learn" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium"
            style={{ color: "rgba(165,243,252,0.7)" }}>
            <ArrowLeftIcon className="w-4 h-4" />
            LearnAI
          </Link>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase"
            style={{ color: "rgba(103,232,249,0.7)" }}>
            Inside the Mind of an LLM
          </span>
        </div>
      </div>

      {/* Intro */}
      <div className="pt-20 pb-12 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase mb-4"
            style={{ color: "rgba(103,232,249,0.7)" }}>
            Three core ideas · Six minutes to read
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight leading-[1.05]"
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #67e8f9 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>
            How an LLM actually works
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "rgba(226,232,240,0.78)" }}>
            Strip away the magic and what's left is three concepts: <strong>tokens</strong>,
            <strong> embeddings</strong>, and <strong>attention</strong>. Master these and the whole
            transformer family stops feeling like a black box.
          </p>
        </div>
      </div>

      {/* Concept 1 — Tokenization */}
      <ConceptSection
        id="tokenization"
        number="01 / TOKENIZATION"
        title="Tokenization"
        description="Your text gets broken into tokens, not words. The model never sees letters or words — only numbers."
      >
        <TokenizationDemo />
      </ConceptSection>

      {/* Concept 2 — Embeddings */}
      <ConceptSection
        id="embeddings"
        number="02 / EMBEDDINGS"
        title="Embeddings"
        description="Each token becomes a vector. Similar meanings are stored close together in the model's vector space."
      >
        <EmbeddingsDemo />
      </ConceptSection>

      {/* Concept 3 — Attention */}
      <ConceptSection
        id="attention"
        number="03 / ATTENTION"
        title="Attention"
        description='The model asks: "which words explain this word?" For "bank", if "river" and "steep" get high attention, "bank" means a riverbank.'
      >
        <AttentionDemo />
      </ConceptSection>

      {/* Outro / Next steps */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #f0f9ff, #67e8f9)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>
            That&apos;s the entire trick.
          </h2>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(226,232,240,0.78)" }}>
            Stack 96 attention layers on top of these three ideas and you have GPT-4o.
            Now pick a roadmap and go deeper.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/learn/roadmap/generative-ai"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.18))",
                border: "1px solid rgba(103,232,249,0.4)",
                color: "white",
                boxShadow: "0 0 30px rgba(103,232,249,0.18)",
              }}>
              Generative AI roadmap <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link href="/learn/roadmap/deep-learning"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{
                background: "rgba(15,23,42,0.85)",
                border: "1px solid rgba(34,211,238,0.20)",
                color: "rgba(226,232,240,0.85)",
              }}>
              Deep Learning roadmap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
