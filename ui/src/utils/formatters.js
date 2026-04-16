export function formatConfidence(value) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function formatLatency(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return `${value} ms`;
}

export function formatTimestamp(value) {
  if (!value) {
    return "just now";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
