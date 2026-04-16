import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ConfidenceMeter from "@/components/ConfidenceMeter";
import { formatConfidence, formatLatency, formatTimestamp } from "@/utils/formatters";
import { deriveThreatLevel } from "@/utils/risk";

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function ResultCard({ result }) {
  const isAdversarial = result.prediction === "ADVERSARIAL";
  const threatLevel = deriveThreatLevel(result.prediction, result.confidence);

  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      animate="visible"
      className="panel-glass scanline rounded-[28px] p-6 sm:p-8"
    >
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={cardItem} className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] ${
                isAdversarial
                  ? "border-rose-400/30 bg-rose-400/12 text-rose-100"
                  : "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
              }`}
            >
              {isAdversarial ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {result.prediction}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.26em] text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Threat Level {threatLevel}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-slate-500">
              Real-time decision
            </p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight text-slate-50">
              {isAdversarial
                ? "Potential adversarial intent detected"
                : "Prompt appears operationally safe"}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Prompt Police fused the model decision with lexical risk surfacing to help
              triage this request faster. Treat confidence as directional signal, then inspect
              the highlighted tokens and intent cues below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div variants={cardItem} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Confidence</p>
              <p className="mt-3 text-2xl font-semibold text-slate-50">
                {formatConfidence(result.confidence)}
              </p>
            </motion.div>
            <motion.div variants={cardItem} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Latency</p>
              <p className="mt-3 text-2xl font-semibold text-slate-50">
                {formatLatency(result.latencyMs)}
              </p>
            </motion.div>
            <motion.div variants={cardItem} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Scanned At</p>
              <p className="mt-3 text-lg font-semibold text-slate-50">
                {formatTimestamp(result.timestamp)}
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={cardItem}
            className="rounded-[24px] border border-white/8 bg-slate-950/45 p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Activity className="h-4 w-4 text-cyan-300" />
              Analyst summary
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-400">
              <li className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                Result was returned by the FastAPI `/predict` backend and timestamped for audit
                review.
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                High confidence does not replace policy review; use the heatmap to inspect
                intent-shaping language and masking tactics.
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          variants={cardItem}
          className="flex items-center justify-center rounded-[28px] border border-white/8 bg-slate-950/55 p-6"
        >
          <ConfidenceMeter
            confidence={result.confidence}
            prediction={result.prediction}
            threatLevel={threatLevel}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
