from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass
class ThresholdResult:
    threshold: float
    fpr: float
    tpr: float


def tune_threshold(
    y_true: Iterable[int],
    probabilities: Iterable[float],
    target_fpr: float = 0.01,
) -> ThresholdResult:
    y_true_array = np.asarray(list(y_true)).astype(int)
    probs_array = np.asarray(list(probabilities)).astype(float)

    negatives = y_true_array == 0
    positives = y_true_array == 1

    if negatives.sum() == 0 or positives.sum() == 0:
        return ThresholdResult(threshold=0.5, fpr=0.0, tpr=0.0)

    best = ThresholdResult(threshold=0.5, fpr=1.0, tpr=0.0)
    for threshold in np.linspace(0.05, 0.99, 190):
        preds = (probs_array >= threshold).astype(int)
        fp = np.logical_and(preds == 1, negatives).sum()
        tn = np.logical_and(preds == 0, negatives).sum()
        tp = np.logical_and(preds == 1, positives).sum()
        fn = np.logical_and(preds == 0, positives).sum()

        fpr = fp / max(fp + tn, 1)
        tpr = tp / max(tp + fn, 1)
        if fpr <= target_fpr and tpr >= best.tpr:
            best = ThresholdResult(threshold=float(threshold), fpr=float(fpr), tpr=float(tpr))

    if best.fpr > target_fpr:
        return ThresholdResult(threshold=0.9, fpr=float(best.fpr), tpr=float(best.tpr))
    return best
