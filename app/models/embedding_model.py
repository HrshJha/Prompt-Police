from __future__ import annotations

from functools import lru_cache
from typing import Iterable

import numpy as np


class EmbeddingEncoder:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        self.model_name = model_name
        self._model = self._load_model(model_name)

    @staticmethod
    @lru_cache(maxsize=2)
    def _load_model(model_name: str):
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(model_name, device="cpu")

    def encode(self, texts: Iterable[str]) -> np.ndarray:
        return np.asarray(
            self._model.encode(
                list(texts),
                batch_size=32,
                show_progress_bar=False,
                normalize_embeddings=False,
                convert_to_numpy=True,
            ),
            dtype=np.float32,
        )
