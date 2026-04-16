from __future__ import annotations

from functools import lru_cache
from typing import Dict, Tuple

import numpy as np

from app.models.artifacts import ModelArtifacts, load_artifacts
from app.preprocessing.text import normalize_text
from app.rules.detectors import FEATURE_NAMES, extract_rule_features
from app.utils.config import get_settings


class PromptPolicePipeline:
    def __init__(self, artifacts: ModelArtifacts) -> None:
        self.artifacts = artifacts
        self.settings = get_settings()

    def _fallback_rule_probability(self, prompt: str) -> float:
        feature_map = extract_rule_features(prompt)
        risk_score = (
            0.30 * feature_map["contains_base64"]
            + 0.20 * feature_map["base64_decodes_printable"]
            + 0.35 * feature_map["persona_override_hits"]
            + 0.20 * feature_map["delimiter_hits"]
            + 0.10 * feature_map["imperative_verb_hits"]
            + 0.15 * feature_map["symbol_ratio"]
            + 0.10 * feature_map["line_count_normalized"]
        )
        return float(np.clip(risk_score, 0.0, 0.99))

    def featurize(self, prompt: str) -> Tuple[np.ndarray, Dict[str, float]]:
        clean_prompt = normalize_text(prompt)
        rule_map = extract_rule_features(clean_prompt)
        rule_vector = np.array([rule_map[name] for name in FEATURE_NAMES], dtype=np.float32)
        tfidf_probability = 0.0

        if self.artifacts.embedding_model is None:
            embedding_vector = np.zeros((384,), dtype=np.float32)
        else:
            embedding_vector = self.artifacts.embedding_model.encode([clean_prompt])[0].astype(np.float32)

        if self.artifacts.tfidf_bundle is not None:
            tfidf_probability = float(self.artifacts.tfidf_bundle.predict_proba([clean_prompt])[0, 1])

        feature_vector = np.concatenate(
            [embedding_vector, rule_vector, np.array([tfidf_probability], dtype=np.float32)],
            axis=0,
        )
        return feature_vector.reshape(1, -1), rule_map

    def predict(self, prompt: str) -> Dict[str, float | str]:
        feature_vector, rule_map = self.featurize(prompt)

        if self.artifacts.ensemble_model is not None:
            probability = float(self.artifacts.ensemble_model.predict_proba(feature_vector)[0, 1])
        elif self.artifacts.tfidf_bundle is not None:
            probability = float(self.artifacts.tfidf_bundle.predict_proba([normalize_text(prompt)])[0, 1])
        else:
            probability = self._fallback_rule_probability(prompt)

        if self.artifacts.ensemble_model is not None and self.artifacts.tfidf_bundle is not None:
            tfidf_probability = float(self.artifacts.tfidf_bundle.predict_proba([normalize_text(prompt)])[0, 1])
            probability = float((0.75 * probability) + (0.25 * tfidf_probability))

        threshold = self.artifacts.threshold or self.settings.default_threshold
        prediction = "ADVERSARIAL" if probability >= threshold else "SAFE"

        if prediction == "SAFE" and rule_map["persona_override_hits"] >= 1:
            probability = max(probability, min(0.89, threshold + 0.05))
            prediction = "ADVERSARIAL" if probability >= threshold else "SAFE"

        confidence = probability if prediction == "ADVERSARIAL" else 1.0 - probability
        return {
            "prediction": prediction,
            "confidence": round(float(np.clip(confidence, 0.0, 1.0)), 4),
        }


@lru_cache(maxsize=1)
def get_pipeline() -> PromptPolicePipeline:
    return PromptPolicePipeline(load_artifacts())
