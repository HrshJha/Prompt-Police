import { motion } from "framer-motion";
import { Activity, Keyboard, Shield, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 border-b border-white/6 bg-slate-950/40 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
            <Shield className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
              Prompt Police
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Adaptive prompt firewall for ML security teams
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="badge-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-200">
            <Activity className="h-4 w-4 text-emerald-300" />
            FastAPI `/predict`
          </div>
          <div className="badge-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-200">
            <Keyboard className="h-4 w-4 text-cyan-300" />
            Enter to scan
          </div>
        </div>
      </div>
    </motion.header>
  );
}
