from __future__ import annotations

from xgboost import XGBClassifier


def build_ensemble_model() -> XGBClassifier:
    return XGBClassifier(
        n_estimators=180,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        reg_lambda=1.2,
        min_child_weight=2,
        random_state=42,
        n_jobs=4,
        tree_method="hist",
    )
