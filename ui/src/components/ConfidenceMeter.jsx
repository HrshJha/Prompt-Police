import { motion } from "framer-motion";

import { formatConfidence } from "@/utils/formatters";

export default function ConfidenceMeter({ confidence, prediction, threatLevel }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, confidence ?? 0));
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor =
    prediction === "ADVERSARIAL" ? "rgba(251, 113, 133, 0.95)" : "rgba(74, 222, 128, 0.95)";

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl" />
      <svg viewBox="0 0 160 160" className="h-44 w-44 -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(148, 163, 184, 0.16)"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{
            filter:
              prediction === "ADVERSARIAL"
                ? "drop-shadow(0 0 12px rgba(251,113,133,0.35))"
                : "drop-shadow(0 0 12px rgba(74,222,128,0.35))",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-3xl font-bold text-slate-50">{formatConfidence(confidence)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">confidence</p>
        </motion.div>

        <span className="mt-4 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
          Threat {threatLevel}
        </span>
      </div>
    </div>
  );
}
