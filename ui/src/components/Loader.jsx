import { motion } from "framer-motion";

export default function Loader({
  title = "Analyzing prompt",
  subtitle = "Running model inference and lexical threat scan",
  compact = false,
}) {
  return (
    <div
      className={`flex items-center gap-4 ${
        compact ? "justify-start" : "flex-col justify-center text-center"
      }`}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border border-cyan-400/15 border-t-cyan-300 border-r-violet-400/80"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-3 rounded-full bg-cyan-400/18 blur-md"
        />
      </div>

      <div className={compact ? "" : "space-y-2"}>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
          {title}
        </p>
        <p className="max-w-sm text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
