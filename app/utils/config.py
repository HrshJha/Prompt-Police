from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    api_prefix: str = ""
    model_dir: str = "artifacts"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    load_embedding_model: bool = True
    default_threshold: float = 0.7
    target_fpr: float = 0.01


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    config_path = os.getenv("PROMPT_POLICE_CONFIG", "configs/default.json")
    path = Path(config_path)

    data = {}
    if path.exists():
        data = json.loads(path.read_text())

    overrides = {
        "api_prefix": os.getenv("API_PREFIX"),
        "model_dir": os.getenv("MODEL_DIR"),
        "embedding_model_name": os.getenv("EMBEDDING_MODEL_NAME"),
        "load_embedding_model": os.getenv("LOAD_EMBEDDING_MODEL"),
        "default_threshold": os.getenv("DEFAULT_THRESHOLD"),
        "target_fpr": os.getenv("TARGET_FPR"),
    }

    if overrides["load_embedding_model"] is not None:
        overrides["load_embedding_model"] = overrides["load_embedding_model"].lower() == "true"
    if overrides["default_threshold"] is not None:
        overrides["default_threshold"] = float(overrides["default_threshold"])
    if overrides["target_fpr"] is not None:
        overrides["target_fpr"] = float(overrides["target_fpr"])

    clean_overrides = {key: value for key, value in overrides.items() if value is not None}
    return Settings(**data, **clean_overrides)
