import { lazy, startTransition, Suspense, useDeferredValue } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Radar, Shield, Sparkles } from "lucide-react";

import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import PromptInput from "@/components/PromptInput";
import { useStore } from "@/store/useStore";
import { samplePrompts } from "@/utils/samplePrompts";

const ResultCard = lazy(() => import("@/components/ResultCard"));
const Heatmap = lazy(() => import("@/components/Heatmap"));

export default function Dashboard() {
  const prompt = useStore((state) => state.prompt);
  const loading = useStore((state) => state.loading);
  const result = useStore((state) => state.result);
  const error = useStore((state) => state.error);
  const setPrompt = useStore((state) => state.setPrompt);
  const analyzePrompt = useStore((state) => state.analyzePrompt);

  const deferredPrompt = useDeferredValue(result?.scannedPrompt ?? prompt);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-12 sm:px-8 lg:pt-16">
        <section className="mb-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200">
                <Radar className="h-3.5 w-3.5" />
                Real-time Prompt Threat Detection
              </div>

              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
                  Security-grade visibility for
                  <span className="text-gradient"> adversarial prompt intent</span>
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-400">
                  Inspect prompt injections, jailbreak attempts, and subtle deception requests
                  through a premium analyst console that feels built for AI red teams and trust
                  & safety engineers.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="panel-glass rounded-3xl p-5">
                <Shield className="h-5 w-5 text-cyan-300" />
                <p className="mt-4 text-sm font-semibold text-slate-100">Inline threat verdicts</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Instantly visualize SAFE vs ADVERSARIAL output with confidence and threat
                  level signals.
                </p>
              </div>
              <div className="panel-glass rounded-3xl p-5">
                <BrainCircuit className="h-5 w-5 text-violet-300" />
                <p className="mt-4 text-sm font-semibold text-slate-100">Heatmapped reasoning cues</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Surface masked intent across research, simulation, and storytelling phrasing.
                </p>
              </div>
              <div className="panel-glass rounded-3xl p-5">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-sm font-semibold text-slate-100">Ready for live demos</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Optimized for a clean `npm run dev` flow against your existing FastAPI
                  backend.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="panel-glass rounded-[28px] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                  Threat operations
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-50">
                  Analyst overview
                </h2>
              </div>
              <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                Backend online
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">API target</p>
                <p className="mt-3 text-lg font-semibold text-slate-50">POST /predict</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The Vite dev server proxies `/api` to `http://127.0.0.1:8000` for a frictionless
                  local workflow.
                </p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recommended flow</p>
                <p className="mt-3 text-lg font-semibold text-slate-50">Paste → Enter → Inspect</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use sample prompts to demo both benign analytical prompts and subtle
                  adversarial disguises.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <PromptInput
            prompt={prompt}
            loading={loading}
            samples={samplePrompts}
            error={error}
            onPromptChange={setPrompt}
            onSampleSelect={(value) => {
              startTransition(() => setPrompt(value));
            }}
            onSubmit={() => analyzePrompt(prompt)}
          />

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="panel-glass rounded-[28px] p-8"
                >
                  <div className="flex min-h-[320px] items-center justify-center">
                    <Loader />
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key={result.timestamp}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <Suspense
                    fallback={
                      <div className="panel-glass rounded-[28px] p-8">
                        <div className="flex min-h-[320px] items-center justify-center">
                          <Loader title="Rendering dashboard" subtitle="Hydrating result modules" />
                        </div>
                      </div>
                    }
                  >
                    <ResultCard result={result} />
                    <Heatmap prompt={deferredPrompt} result={result} />
                  </Suspense>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="panel-glass rounded-[28px] p-8"
                >
                  <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/15 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                      <Shield className="h-8 w-8 text-cyan-200" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-50">
                      Results appear here
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                      Scan any prompt to reveal the model verdict, animated confidence meter,
                      threat level indicator, and token heatmap.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
