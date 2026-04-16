import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

import Loader from "@/components/Loader";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

export default function App() {
  return (
    <div className="app-shell relative min-h-screen overflow-hidden bg-[#030712] text-slate-100">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(129,140,248,0.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(244,114,182,0.14),transparent_35%)]" />

      <motion.div
        animate={{ x: [0, 30, -24, 0], y: [0, -24, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[8%] top-[18%] h-64 w-64 rounded-full bg-cyan-400/15 blur-[90px]"
      />
      <motion.div
        animate={{ x: [0, -42, 20, 0], y: [0, 26, -18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[10%] top-[10%] h-72 w-72 rounded-full bg-violet-500/12 blur-[110px]"
      />
      <motion.div
        animate={{ x: [0, 20, -16, 0], y: [0, -18, 24, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-[8%] left-[22%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[120px]"
      />

      <div className="relative z-10">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center px-6">
              <Loader
                title="Booting Prompt Police"
                subtitle="Initializing the threat detection dashboard"
              />
            </div>
          }
        >
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
}
