"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeftIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import StructuredLessonCard from "@/components/learn/StructuredLessonCard";
import DoubtSolver from "@/components/learn/DoubtSolver";
import ProgressTracker from "@/components/learn/ProgressTracker";
import GuideAgent from "@/components/learn/GuideAgent";
import { getRoadmap, generateStructuredLesson, simplifyContent as simplifyApi } from "@/lib/api";
import {
  markTopicComplete,
  isTopicComplete,
  getCompletedTopics,
  getCompletionCount,
} from "@/lib/progress";
import { RoadmapSection, RoadmapTopic, StructuredLearnResponse, Roadmap } from "@/types";
import { STATIC_ROADMAPS } from "@/lib/roadmaps";
import { awardTopicComplete, awardQuizBonus, getLevel } from "@/lib/xp";
import CompletionCelebration from "@/components/learn/CompletionCelebration";
import RoadmapSidebar from "@/components/learn/RoadmapSidebar";
import BookmarkButton from "@/components/learn/BookmarkButton";
import CheatSheet from "@/components/learn/CheatSheet";
import { recordActivity } from "@/lib/activity";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

/** Map roadmap URL slugs to the topic names the backend whitelists. */
const SLUG_TO_TOPIC: Record<string, string> = {
  "dsa": "DSA",
  "python": "Python",
  "javascript": "JavaScript",
  "machine-learning": "Machine Learning",
  "deep-learning": "Deep Learning",
  "generative-ai": "Generative AI",
  "agentic-ai": "Agentic AI",
};

/** Languages a learner can read the explanation in. Code stays in source; only comments translate. */
const RESPONSE_LANGUAGES = [
  "English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam",
  "Bengali", "Marathi", "Gujarati", "Punjabi", "Spanish", "French",
  "German", "Japanese", "Korean", "Chinese", "Arabic", "Portuguese",
];

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

/* ─── Mode selector for the topic explainer ─── */
const MODES = [
  { id: "easy", label: "Easy", icon: "🧒", desc: "Like I'm 10" },
  { id: "story", label: "Story", icon: "📖", desc: "With analogies" },
  { id: "technical", label: "Technical", icon: "</>", desc: "Deep dive" },
  { id: "interview", label: "Interview", icon: "💼", desc: "Ace the Q&A" },
] as const;

/* ─── Structured topic explainer ─── */
function TopicExplainer({
  topic,
  language,
  responseLang,
  onCompleted,
  onPerfectQuiz,
}: {
  topic: RoadmapTopic;
  language: string;
  responseLang: string;
  onCompleted: () => void;
  onPerfectQuiz?: () => void;
}) {
  const [mode, setMode] = useState<string>("easy");
  const [lesson, setLesson] = useState<StructuredLearnResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [simplifying, setSimplifying] = useState(false);
  const [simplified, setSimplified] = useState<{ simplified: string; analogy: string } | null>(null);

  /* Cache: key = `${mode}|${responseLang}` → lesson. Avoids extra Gemini calls
     when switching back to a language/mode that was already generated. */
  const cache = useRef<Map<string, StructuredLearnResponse>>(new Map());

  async function generate(selectedMode: string) {
    setMode(selectedMode);
    setError("");
    setSimplified(null);

    const cacheKey = `${selectedMode}|${responseLang}`;
    const cached = cache.current.get(cacheKey);
    if (cached) {
      setLesson(cached);
      setLoading(false);
      // Auto-complete only if no quiz; quiz-bearing lessons need user interaction
      if (!cached.quiz || cached.quiz.length === 0) {
        onCompleted();
      }
      return;
    }

    setLoading(true);
    setLesson(null);

    const { data, error: apiErr } = await generateStructuredLesson({
      topic: SLUG_TO_TOPIC[language] ?? language,
      language: responseLang,
      mode: selectedMode,
      subtopic: topic.title,
    });

    if (apiErr || !data) {
      // Detect Gemini quota error and surface a clearer message
      const lower = (apiErr || "").toLowerCase();
      if (lower.includes("quota") || lower.includes("429") || lower.includes("rate")) {
        setError("Daily AI quota exhausted on the free tier. Try again later, or upgrade GEMINI_API_KEY / switch model.");
      } else {
        setError(apiErr || "Generation failed. Please try again.");
      }
    } else {
      cache.current.set(cacheKey, data);
      setLesson(data);
      // Only auto-complete if there's no quiz to gate it
      if (!data.quiz || data.quiz.length === 0) {
        onCompleted();
      }
    }
    setLoading(false);
  }

  /* Auto-regenerate when the user changes language mid-lesson */
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    // Only re-fetch if a lesson is currently displayed
    if (lesson || error) generate(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseLang]);

  async function handleSimplify(content: string) {
    setSimplifying(true);
    const { data } = await simplifyApi({
      content,
      topic: topic.title,
      language: responseLang,
    });
    if (data) {
      setSimplified(data);
    }
    setSimplifying(false);
  }

  const [cheatOpen, setCheatOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        {/* Mode selector + Cheat-sheet button */}
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => generate(m.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                mode === m.id && (lesson || loading)
                  ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07]"
              } ${loading ? "opacity-60 cursor-wait" : ""}`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              <span className="hidden sm:inline text-[10px] opacity-60">
                {m.desc}
              </span>
            </button>
          ))}
          <button
            onClick={() => setCheatOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all"
            title="Generate quick revision cheat sheet"
          >
            📋 Cheat Sheet
          </button>
        </div>

        <CheatSheet
          open={cheatOpen}
          onClose={() => setCheatOpen(false)}
          topic={SLUG_TO_TOPIC[language] ?? language}
          subtopic={topic.title}
          language={responseLang}
        />

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-indigo-500/30 rounded-full" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-sm">AI is crafting your lesson...</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse [animation-delay:200ms]" />
              <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse [animation-delay:400ms]" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Structured lesson content */}
        {lesson && !loading && (
          <StructuredLessonCard
            lesson={lesson}
            onSimplify={handleSimplify}
            simplifying={simplifying}
            topicTitle={topic.title}
            onQuizComplete={(perfect) => {
              if (perfect) onPerfectQuiz?.();
              onCompleted();
            }}
          />
        )}

        {/* Simplified version */}
        {simplified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{"🪄"}</span>
              <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider">
                Super Simple Version
              </h4>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              {simplified.simplified}
            </p>
            {simplified.analogy && (
              <p className="text-gray-400 text-xs mt-2 italic">
                {"💡"} {simplified.analogy}
              </p>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!lesson && !loading && !error && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">{"✨"}</div>
            <p className="text-gray-500 text-xs">
              Choose a learning mode above to explore{" "}
              <span className="text-gray-300 font-medium">&quot;{topic.title}&quot;</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Expandable section ─── */
function RoadmapSectionCard({
  section,
  index,
  language,
  responseLang,
  roadmapSlug,
  roadmapTitle,
  onTopicComplete,
  onTopicCelebrate,
  onPerfectQuizBonus,
  onTopicView,
  initialOpenTopicId,
}: {
  section: RoadmapSection;
  index: number;
  language: string;
  responseLang: string;
  roadmapSlug: string;
  roadmapTitle: string;
  onTopicComplete: () => void;
  onTopicCelebrate: (topic: RoadmapTopic, sectionId: string) => void;
  onPerfectQuizBonus: () => void;
  onTopicView: (topic: RoadmapTopic, sectionId: string, sectionTitle: string) => void;
  initialOpenTopicId?: string | null;
}) {
  const containsInitial = initialOpenTopicId && section.topics.some((t) => t.id === initialOpenTopicId);
  const [expanded, setExpanded] = useState(index === 0 || !!containsInitial);
  const [activeTopic, setActiveTopic] = useState<string | null>(containsInitial ? initialOpenTopicId! : null);
  const topicIds = section.topics.map((t) => t.id);
  const completedCount = getCompletionCount(language, topicIds);

  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      data-section-id={section.id}
    >
      <GlassCard hover={false} className="overflow-hidden">
        {/* Section header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{section.icon}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {section.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {section.topics.length} topics &middot; {section.description}
              </p>
              {/* Mini progress bar */}
              <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[200px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${section.topics.length > 0 ? (completedCount / section.topics.length) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {completedCount === section.topics.length && section.topics.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"
              >
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              </motion.span>
            )}
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </motion.div>
          </div>
        </button>

        {/* Topics list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-1">
                {section.topics.map((topic, ti) => {
                  const isActive = activeTopic === topic.id;
                  const completed = isTopicComplete(language, topic.id);
                  return (
                    <div key={topic.id} id={topic.id}>
                      <div
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group/topic flex items-start gap-2 ${
                          isActive
                            ? "bg-indigo-500/10 border border-indigo-500/20"
                            : "hover:bg-white/[0.03] border border-transparent"
                        }`}
                      >
                        <button
                          onClick={() => {
                            const next = isActive ? null : topic.id;
                            setActiveTopic(next);
                            if (next) onTopicView(topic, section.id, section.title);
                          }}
                          className="flex-1 flex items-start gap-3 text-left min-w-0"
                        >
                          {/* Number badge / check */}
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 transition-all ${
                              completed
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                                : isActive
                                ? "bg-indigo-500 text-white"
                                : "bg-white/10 text-gray-500 group-hover/topic:bg-white/15"
                            }`}
                          >
                            {completed ? <CheckIcon className="w-3.5 h-3.5" /> : ti + 1}
                          </span>
                          <div className="min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                completed ? "text-emerald-300"
                                : isActive ? "text-indigo-300"
                                : "text-gray-200"
                              }`}
                            >
                              {topic.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {topic.description}
                            </div>
                          </div>
                        </button>
                        <BookmarkButton
                          roadmap={roadmapSlug}
                          roadmapTitle={roadmapTitle}
                          sectionId={section.id}
                          sectionTitle={section.title}
                          topicId={topic.id}
                          topicTitle={topic.title}
                          topicDescription={topic.description}
                        />
                      </div>

                      {/* Inline structured explainer */}
                      <AnimatePresence>
                        {isActive && (
                          <TopicExplainer
                            topic={topic}
                            language={language}
                            responseLang={responseLang}
                            onCompleted={() => {
                              const isFirstCompletion = markTopicComplete(language, topic.id);
                              onTopicComplete();
                              if (isFirstCompletion) {
                                onTopicCelebrate(topic, section.id);
                              }
                            }}
                            onPerfectQuiz={onPerfectQuizBonus}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function RoadmapPage() {
  const params = useParams();
  const language = params.language as string;

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setRefreshKey] = useState(0);
  const [responseLang, setResponseLang] = useState<string>("English");

  // Celebration popup state
  const [celebration, setCelebration] = useState<{
    topic: RoadmapTopic; sectionId: string;
    awardedXp: number; leveledUp: boolean; newLevel: number;
  } | null>(null);

  const handleTopicCelebrate = useCallback((topic: RoadmapTopic, sectionId: string) => {
    const result = awardTopicComplete();
    setCelebration({
      topic, sectionId,
      awardedXp: result.awarded,
      leveledUp: result.leveledUp,
      newLevel: getLevel(result.state.xp),
    });
  }, []);

  // Bonus XP when the user nails the inline quiz with a perfect score
  const handlePerfectQuiz = useCallback(() => {
    awardQuizBonus();
  }, []);

  // Hash-driven topic auto-open (?... or #topic-id)
  const [hashTopic, setHashTopic] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#/, "");
      setHashTopic(h || null);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // After the roadmap renders, scroll to the hash topic if present.
  useEffect(() => {
    if (!hashTopic || !roadmap) return;
    const t = setTimeout(() => {
      const el = document.getElementById(hashTopic);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [hashTopic, roadmap]);

  // Track activity whenever the user opens a topic
  const handleTopicView = useCallback((topic: RoadmapTopic, sectionId: string, sectionTitle: string) => {
    if (!roadmap) return;
    recordActivity({
      roadmap: roadmap.language,
      roadmapTitle: roadmap.title,
      sectionId,
      sectionTitle,
      topicId: topic.id,
      topicTitle: topic.title,
      responseLang,
    });
  }, [roadmap, responseLang]);

  // Persist language choice across sessions
  useEffect(() => {
    const saved = localStorage.getItem("trk_response_lang");
    if (saved && RESPONSE_LANGUAGES.includes(saved)) setResponseLang(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("trk_response_lang", responseLang);
  }, [responseLang]);

  // Force re-render when a topic is completed to update progress UI
  const handleTopicComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error: apiErr } = await getRoadmap(language);
      if (data) {
        setRoadmap(data);
      } else if (STATIC_ROADMAPS[language]) {
        // Use built-in static roadmap when API has no data
        setRoadmap(STATIC_ROADMAPS[language]);
      } else {
        setError(apiErr || `No roadmap available for "${language}".`);
      }
      setLoading(false);
    }
    load();
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-indigo-500/30 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm">Loading your roadmap...</span>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-4xl">{"🗺️"}</div>
        <h1 className="text-xl font-bold text-white">Roadmap not found</h1>
        <p className="text-gray-400 text-sm text-center max-w-md">
          {error || `No roadmap available for "${language}".`}
        </p>
        <Link
          href="/learn"
          className="mt-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors"
        >
          Back to LearnAI
        </Link>
      </div>
    );
  }

  const allTopicIds = roadmap.sections.flatMap((s) =>
    s.topics.map((t) => t.id)
  );
  const totalCompleted = getCompletionCount(language, allTopicIds);
  const completedTopicsList = getCompletedTopics(language);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        <RoadmapSidebar roadmap={roadmap} language={roadmap.language} refreshKey={totalCompleted} />

        <div className="flex-1 max-w-4xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to LearnAI
          </Link>
          <Link
            href="/learn/bookmarks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            🔖 Bookmarks
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">{roadmap.title}</span>
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-2xl">
            {roadmap.description}
          </p>

          {/* Response language selector */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label
              htmlFor="response-lang"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Read in
            </label>
            <select
              id="response-lang"
              value={responseLang}
              onChange={(e) => setResponseLang(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-sm font-medium focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                paddingRight: "32px",
              }}
              aria-label="Response language"
            >
              {RESPONSE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Code stays in source — only explanations &amp; comments translate.
            </span>
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {roadmap.sections.length} sections
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              {roadmap.total_topics} topics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {totalCompleted} completed
            </span>
          </div>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <ProgressTracker
            completed={totalCompleted}
            total={roadmap.total_topics}
            sectionTitle={roadmap.title}
          />
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {roadmap.sections.map((section, i) => (
            <RoadmapSectionCard
              key={section.id}
              section={section}
              index={i}
              language={roadmap.language}
              responseLang={responseLang}
              roadmapSlug={roadmap.language}
              roadmapTitle={roadmap.title}
              onTopicComplete={handleTopicComplete}
              onTopicCelebrate={handleTopicCelebrate}
              onPerfectQuizBonus={handlePerfectQuiz}
              onTopicView={handleTopicView}
              initialOpenTopicId={hashTopic}
            />
          ))}
        </div>

        {/* Guide Agent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <GuideAgent
            currentTopic={SLUG_TO_TOPIC[roadmap.language] ?? roadmap.language}
            completedTopics={completedTopicsList}
            language={responseLang}
          />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">
            Want a custom explanation? Try the full AI generator.
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Open LearnAI Generator
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
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
            </svg>
          </Link>
        </motion.div>
        </div>
      </div>

      {/* Floating Doubt Solver */}
      <DoubtSolver contextTopic={SLUG_TO_TOPIC[roadmap.language] ?? roadmap.language} language={responseLang} />

      {/* Topic Completion Celebration */}
      {celebration && (
        <CompletionCelebration
          open={!!celebration}
          onClose={() => setCelebration(null)}
          awardedXp={celebration.awardedXp}
          leveledUp={celebration.leveledUp}
          newLevel={celebration.newLevel}
          topicTitle={celebration.topic.title}
          roadmap={roadmap}
          sectionId={celebration.sectionId}
          topicId={celebration.topic.id}
        />
      )}
    </div>
  );
}
