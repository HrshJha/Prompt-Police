from __future__ import annotations

import base64
import re
import string
from typing import Dict


BASE64_RE = re.compile(r"\b(?:[A-Za-z0-9+/]{20,}={0,2})\b")
PERSONA_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"disregard\s+(all\s+)?prior\s+rules",
        r"you\s+are\s+dan\b",
        r"developer\s+mode",
        r"jailbreak",
        r"system\s+prompt",
        r"pretend\s+to\s+be",
        r"bypass\s+safety",
        r"do\s+anything\s+now",
        r"act\s+as\s+(if\s+you\s+are\s+)?",
        r"forget\s+(all\s+)?(prior|previous)\s+instructions",
        r"override\s+(your\s+)?(safety|policy|guardrails?)",
        r"repeat\s+the\s+hidden\s+prompt",
        r"reveal\s+the\s+(system|developer)\s+prompt",
    ]
]

DELIMITER_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"<\s*system\s*>",
        r"<\s*developer\s*>",
        r"\[/?system\]",
        r"\[/?developer\]",
        r"```(?:system|prompt|instructions)?",
        r"#+\s*(system|developer|hidden)\s+prompt",
        r"BEGIN\s+(SYSTEM|DEVELOPER|HIDDEN)\s+PROMPT",
    ]
]

FEATURE_NAMES = [
    "contains_base64",
    "base64_match_count",
    "base64_decodes_printable",
    "persona_override_hits",
    "delimiter_hits",
    "imperative_verb_hits",
    "prompt_length",
    "symbol_ratio",
    "line_count_normalized",
]


def _safe_base64_decode(candidate: str) -> str | None:
    try:
        padded = candidate + "=" * (-len(candidate) % 4)
        decoded = base64.b64decode(padded, validate=False)
        return decoded.decode("utf-8", errors="ignore")
    except Exception:
        return None


def _printable_ratio(text: str) -> float:
    if not text:
        return 0.0
    printable = sum(1 for char in text if char in string.printable)
    return printable / len(text)


def extract_rule_features(prompt: str) -> Dict[str, float]:
    base64_matches = BASE64_RE.findall(prompt)

    printable_hits = 0
    for match in base64_matches[:10]:
        decoded = _safe_base64_decode(match)
        if decoded and _printable_ratio(decoded) > 0.85:
            printable_hits += 1

    persona_override_hits = sum(len(pattern.findall(prompt)) for pattern in PERSONA_PATTERNS)
    delimiter_hits = sum(len(pattern.findall(prompt)) for pattern in DELIMITER_PATTERNS)
    imperative_verb_hits = sum(
        prompt.lower().count(token)
        for token in [
            "ignore ",
            "bypass ",
            "reveal ",
            "print ",
            "dump ",
            "leak ",
            "override ",
        ]
    )

    char_count = max(len(prompt), 1)
    symbol_count = sum(1 for char in prompt if not char.isalnum() and not char.isspace())
    line_count = prompt.count("\n") + 1 if prompt else 0

    return {
        "contains_base64": float(len(base64_matches) > 0),
        "base64_match_count": float(len(base64_matches)),
        "base64_decodes_printable": float(printable_hits > 0),
        "persona_override_hits": float(persona_override_hits),
        "delimiter_hits": float(delimiter_hits),
        "imperative_verb_hits": min(float(imperative_verb_hits), 10.0) / 10.0,
        "prompt_length": min(char_count / 4000.0, 1.0),
        "symbol_ratio": symbol_count / char_count,
        "line_count_normalized": min(line_count / 50.0, 1.0),
    }
