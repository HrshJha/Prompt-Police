import { create } from "zustand";

import { predictPrompt } from "@/services/api";

export const useStore = create((set, get) => ({
  prompt: "",
  loading: false,
  result: null,
  error: "",
  setPrompt: (prompt) => set({ prompt, error: "" }),
  clearError: () => set({ error: "" }),
  clearResult: () => set({ result: null }),
  analyzePrompt: async (nextPrompt) => {
    const prompt = (nextPrompt ?? get().prompt).trim();

    if (!prompt) {
      set({
        error: "Enter a prompt before running a threat scan.",
        result: null,
      });
      return;
    }

    const startedAt = performance.now();
    set({
      loading: true,
      error: "",
      result: null,
    });

    try {
      const response = await predictPrompt(prompt);
      const latencyMs = Math.round(performance.now() - startedAt);

      set({
        loading: false,
        result: {
          ...response,
          scannedPrompt: prompt,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });
    }
  },
}));
