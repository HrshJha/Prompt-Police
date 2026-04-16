from __future__ import annotations

from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from app.inference.threshold import ThresholdResult, tune_threshold
from app.rules.detectors import FEATURE_NAMES, extract_rule_features
from app.utils.io import ensure_dir


def split_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    train_df, valid_df = train_test_split(
        df,
        test_size=0.2,
        random_state=42,
        stratify=df["label"],
    )
    return train_df.reset_index(drop=True), valid_df.reset_index(drop=True)


def rule_feature_matrix(prompts: list[str]) -> np.ndarray:
    rows = []
    for prompt in prompts:
        feature_map = extract_rule_features(prompt)
        rows.append([feature_map[name] for name in FEATURE_NAMES])
    return np.asarray(rows, dtype=np.float32)


def add_tfidf_score_feature(base_matrix: np.ndarray, tfidf_scores: np.ndarray) -> np.ndarray:
    tfidf_scores = np.asarray(tfidf_scores, dtype=np.float32).reshape(-1, 1)
    return np.concatenate([base_matrix, tfidf_scores], axis=1)


def save_joblib(obj: object, path: str | Path) -> None:
    path = Path(path)
    ensure_dir(path.parent)
    joblib.dump(obj, path)


def save_threshold(result: ThresholdResult, path: str | Path) -> None:
    save_joblib(
        {
            "threshold": result.threshold,
            "fpr": result.fpr,
            "tpr": result.tpr,
        },
        path,
    )
