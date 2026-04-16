from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import joblib

from app.models.embedding_model import EmbeddingEncoder
from app.models.tfidf_model import TFIDFBundle
from app.utils.config import get_settings


@dataclass
class ModelArtifacts:
    tfidf_bundle: Optional[TFIDFBundle]
    embedding_model: Optional[EmbeddingEncoder]
    ensemble_model: Optional[object]
    threshold: Optional[float]


def _load_joblib(path: Path) -> object | None:
    if path.exists():
        return joblib.load(path)
    return None


def load_artifacts() -> ModelArtifacts:
    settings = get_settings()
    artifacts_dir = Path(settings.model_dir)

    tfidf_artifact = _load_joblib(artifacts_dir / "tfidf_bundle.joblib")
    ensemble_model = _load_joblib(artifacts_dir / "ensemble_model.joblib")
    threshold_bundle = _load_joblib(artifacts_dir / "threshold.joblib")

    embedding_model = None
    if settings.load_embedding_model:
        try:
            embedding_model = EmbeddingEncoder(model_name=settings.embedding_model_name)
        except Exception:
            embedding_model = None

    threshold = None
    if isinstance(threshold_bundle, dict):
        threshold = float(threshold_bundle.get("threshold", settings.default_threshold))

    return ModelArtifacts(
        tfidf_bundle=tfidf_artifact,
        embedding_model=embedding_model,
        ensemble_model=ensemble_model,
        threshold=threshold,
    )
