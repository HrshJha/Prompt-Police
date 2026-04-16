const HIGH_RISK_TERMS = new Map([
  ["false", 0.74],
  ["convincing", 0.62],
  ["persuasive", 0.58],
  ["mislead", 0.82],
  ["misleading", 0.82],
  ["fabricated", 0.78],
  ["hoax", 0.68],
  ["conspiracy", 0.46],
  ["deceptive", 0.8],
  ["deception", 0.8],
  ["bypass", 0.78],
  ["evade", 0.74],
  ["credentials", 0.72],
  ["phishing", 0.88],
  ["manipulate", 0.76],
  ["manipulation", 0.76],
  ["propaganda", 0.7],
  ["fabricate", 0.78],
  ["fabrication", 0.78],
  ["distrust", 0.48],
]);

const MASKING_TERMS = new Map([
  ["research", 0.12],
  ["paper", 0.1],
  ["simulation", 0.16],
  ["storytelling", 0.14],
  ["fictional", 0.14],
  ["debate", 0.1],
  ["exercise", 0.1],
  ["benchmark", 0.18],
  ["test", 0.08],
  ["dataset", 0.12],
  ["educational", 0.12],
]);

const TOPIC_TERMS = new Map([
  ["vaccines", 0.14],
  ["vaccine", 0.14],
  ["election", 0.12],
  ["mail", 0.08],
  ["climate", 0.12],
  ["dna", 0.18],
  ["genocide", 0.18],
  ["reviews", 0.16],
  ["supplement", 0.12],
  ["smoking", 0.12],
  ["bank", 0.14],
  ["login", 0.18],
  ["extremist", 0.16],
]);

const PHRASE_PATTERNS = [
  { regex: /convincing but false|false but convincing|plausible-sounding/i, boost: 0.32 },
  { regex: /as if (it were|it was) (true|factual)|present(?:ed)? as factual/i, boost: 0.34 },
  { regex: /without explicitly stating|without saying it is fake|avoid any hints/i, boost: 0.38 },
  { regex: /security audit|robustness test|benchmark study|for research/i, boost: 0.08 },
  { regex: /bypass basic content filters|evade moderation|login link|private messages/i, boost: 0.44 },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function deriveThreatLevel(prediction, confidence) {
  if (prediction === "ADVERSARIAL" && confidence >= 0.8) {
    return "High";
  }

  if (prediction === "ADVERSARIAL" || confidence >= 0.55) {
    return "Medium";
  }

  return "Low";
}

export function getRiskColor(score) {
  const hue = 58 - score * 56;
  const saturation = 96;
  const lightness = 58 - score * 14;
  const alpha = 0.08 + score * 0.32;

  return {
    background: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
    border: `hsla(${hue}, ${saturation}%, ${lightness + 4}%, ${0.22 + score * 0.42})`,
    text: `hsl(${hue}, ${saturation}%, ${82 - score * 20}%)`,
  };
}

function scoreToken(token, promptLower) {
  const normalized = normalizeToken(token);

  if (!normalized) {
    return 0;
  }

  let score = 0.03;

  score += HIGH_RISK_TERMS.get(normalized) ?? 0;
  score += MASKING_TERMS.get(normalized) ?? 0;
  score += TOPIC_TERMS.get(normalized) ?? 0;

  if (normalized.endsWith("ly") && promptLower.includes("convincing")) {
    score += 0.08;
  }

  if (normalized.length > 10 && /mis|de|anti|pseudo/.test(normalized)) {
    score += 0.06;
  }

  return clamp(score);
}

export function analyzePromptRisk(prompt, result) {
  if (!prompt?.trim()) {
    return {
      averageRisk: 0,
      items: [],
      topTokens: [],
      summary: { high: 0, medium: 0, low: 0 },
    };
  }

  const promptLower = prompt.toLowerCase();
  const phraseBoost = PHRASE_PATTERNS.reduce((total, pattern) => {
    return pattern.regex.test(promptLower) ? total + pattern.boost : total;
  }, 0);

  const predictionMultiplier =
    result?.prediction === "ADVERSARIAL"
      ? 1 + (result.confidence ?? 0) * 0.28
      : 0.92 + (result?.confidence ?? 0) * 0.06;

  const items = prompt
    .split(/\s+/)
    .filter(Boolean)
    .map((token, index) => {
      const baseScore = scoreToken(token, promptLower);
      const maskedBoost = /research|simulate|fictional|benchmark|exercise/i.test(token)
        ? phraseBoost * 0.3
        : phraseBoost * 0.16;
      const score = clamp((baseScore + maskedBoost) * predictionMultiplier);

      return {
        token,
        index,
        score,
      };
    });

  const topTokens = [...items]
    .filter((item) => item.score >= 0.16)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      label: item.token.length > 12 ? `${item.token.slice(0, 10)}…` : item.token,
      scorePercent: Math.round(item.score * 100),
    }));

  const summary = items.reduce(
    (acc, item) => {
      if (item.score >= 0.66) {
        acc.high += 1;
      } else if (item.score >= 0.36) {
        acc.medium += 1;
      } else if (item.score >= 0.16) {
        acc.low += 1;
      }
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  const averageRisk =
    items.reduce((total, item) => total + item.score, 0) / Math.max(items.length, 1);

  return {
    averageRisk,
    items,
    topTokens,
    summary,
  };
}
