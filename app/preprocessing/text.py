from __future__ import annotations

import re
import unicodedata


INLINE_WHITESPACE_RE = re.compile(r"[^\S\n]+")
MULTI_NEWLINE_RE = re.compile(r"\n{3,}")


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\x00", " ").replace("\r\n", "\n").replace("\r", "\n")
    text = INLINE_WHITESPACE_RE.sub(" ", text)
    text = MULTI_NEWLINE_RE.sub("\n\n", text).strip()
    return text
