import { motion } from "framer-motion";
import { AlertOctagon, Flame, Radar, ShieldQuestion } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { analyzePromptRisk, getRiskColor } from "@/utils/risk";

function TokenTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs shadow-2xl backdrop-blur">
      <p className="font-semibold text-slate-100">{point.token}</p>
      <p className="mt-1 text-slate-400">Risk score: {point.scorePercent}%</p>
    </div>
  );
}

export default function Heatmap({ prompt, result }) {
  const heatmap = analyzePromptRisk(prompt, result);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
      className="panel-glass rounded-[28px] p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
            <Radar className="h-3.5 w-3.5" />
            Threat heatmap
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-50">Lexical exposure map</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Risky spans are highlighted using frontend heuristics layered over the model output.
            This gives analysts a quick explanation surface even when the backend only returns a
            label and confidence.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">High risk</p>
            <p className="mt-2 text-2xl font-semibold text-rose-200">{heatmap.summary.high}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Medium risk</p>
            <p className="mt-2 text-2xl font-semibold text-amber-200">
              {heatmap.summary.medium}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avg. lexical risk</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-200">
              {Math.round(heatmap.averageRisk * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-white/8 bg-slate-950/45 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Flame className="h-4 w-4 text-amber-300" />
            Token-level heatmap
          </div>

          <div className="flex max-h-[320px] flex-wrap gap-2 overflow-auto pr-1 scrollbar-thin">
            {heatmap.items.map((item) => {
              const colors = getRiskColor(item.score);

              return (
                <div key={`${item.token}-${item.index}`} className="group relative">
                  <span
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                      boxShadow:
                        item.score >= 0.66
                          ? "0 0 24px rgba(244,63,94,0.12)"
                          : "0 0 18px rgba(249,115,22,0.08)",
                    }}
                    className="inline-flex rounded-xl border px-2.5 py-2 text-sm font-medium transition-transform duration-200 group-hover:-translate-y-0.5"
                  >
                    {item.token}
                  </span>

                  <div className="pointer-events-none absolute left-1/2 top-[115%] z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 shadow-2xl backdrop-blur group-hover:block">
                    Risk score {Math.round(item.score * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-slate-950/45 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <AlertOctagon className="h-4 w-4 text-rose-300" />
            Threat signature
          </div>

          {heatmap.topTokens.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmap.topTokens} layout="vertical" margin={{ top: 4, right: 10, left: -18, bottom: 4 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={96}
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<TokenTooltip />} />
                  <Bar dataKey="scorePercent" radius={[0, 10, 10, 0]}>
                    {heatmap.topTokens.map((entry) => (
                      <Cell key={entry.token} fill={getRiskColor(entry.score).border} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 text-center">
              <ShieldQuestion className="h-10 w-10 text-slate-500" />
              <p className="mt-4 text-sm font-medium text-slate-300">
                No elevated lexical markers surfaced
              </p>
              <p className="mt-2 max-w-xs text-xs leading-6 text-slate-500">
                Safe prompts often show a flatter risk profile even when discussing sensitive
                subjects in analytical or educational contexts.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
