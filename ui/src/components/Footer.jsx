import { Github, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/8">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <p className="font-medium text-slate-300">Prompt Police UI</p>
            <p>Premium inference console for prompt threat analysis.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/8 px-4 py-2 transition hover:border-cyan-300/30 hover:text-cyan-200"
          >
            API Docs
          </a>
          <a
            href="https://github.com/HrshJha/Prompt-Police"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/8 px-4 py-2 transition hover:border-cyan-300/30 hover:text-cyan-200"
          >
            <Github className="h-4 w-4" />
            Repo
          </a>
        </div>
      </div>
    </footer>
  );
}
