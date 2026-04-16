from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


@dataclass
class TFIDFBundle:
    pipeline: Pipeline

    def predict_proba(self, texts: Iterable[str]) -> np.ndarray:
        return self.pipeline.predict_proba(list(texts))


def build_tfidf_bundle() -> TFIDFBundle:
    pipeline = Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    analyzer="word",
                    ngram_range=(1, 3),
                    min_df=1,
                    max_features=50000,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    solver="liblinear",
                    max_iter=1000,
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ]
    )
    return TFIDFBundle(pipeline=pipeline)
