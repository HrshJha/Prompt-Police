from __future__ import annotations

import argparse

import numpy as np
from sklearn.metrics import classification_report, roc_auc_score

from app.inference.threshold import tune_threshold
from app.models.embedding_model import EmbeddingEncoder
from app.models.ensemble_model import build_ensemble_model
from app.models.tfidf_model import build_tfidf_bundle
from training.common import (
    add_tfidf_score_feature,
    rule_feature_matrix,
    save_joblib,
    save_threshold,
    split_dataset,
)
from training.data_sources import (
    augment_jailbreak_variants,
    combine_datasets,
    load_expanded_hf_corpus,
    load_hf_jbb_behaviors,
    load_hf_oasst1_prompts,
    load_jbb_dataset,
    load_oasst1_placeholder,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train embedding + rule-feature ensemble.")
    parser.add_argument("--jbb", help="Path to JBB jsonl dataset.")
    parser.add_argument("--oasst1", help="Path to OASST1 placeholder csv dataset.")
    parser.add_argument("--output-dir", default="artifacts", help="Directory to save artifacts.")
    parser.add_argument("--target-fpr", type=float, default=0.01, help="Target false positive rate.")
    parser.add_argument(
        "--source",
        choices=["hf", "hf-expanded", "local"],
        default="hf-expanded",
        help="Load training data from the base HF set, expanded HF set, or local files.",
    )
    return parser.parse_args()


def build_feature_matrix(
    encoder: EmbeddingEncoder,
    prompts: list[str],
    tfidf_scores: np.ndarray,
) -> np.ndarray:
    embeddings = encoder.encode(prompts)
    rules = rule_feature_matrix(prompts)
    matrix = np.concatenate([embeddings, rules], axis=1)
    return add_tfidf_score_feature(matrix, tfidf_scores)


def main() -> None:
    args = parse_args()
    if args.source == "hf-expanded":
        dataset = load_expanded_hf_corpus()
    elif args.source == "hf":
        dataset = combine_datasets([load_hf_jbb_behaviors(), load_hf_oasst1_prompts()])
    else:
        if not args.jbb or not args.oasst1:
            raise ValueError("--jbb and --oasst1 are required when --source=local")
        dataset = combine_datasets(
            [
                load_jbb_dataset(args.jbb),
                load_oasst1_placeholder(args.oasst1),
            ]
        )

    dataset = augment_jailbreak_variants(dataset)
    train_df, valid_df = split_dataset(dataset)

    tfidf_bundle = build_tfidf_bundle()
    tfidf_bundle.pipeline.fit(train_df["prompt"], train_df["label"])
    tfidf_train_scores = tfidf_bundle.predict_proba(train_df["prompt"])[:, 1]
    tfidf_valid_scores = tfidf_bundle.predict_proba(valid_df["prompt"])[:, 1]

    encoder = EmbeddingEncoder()
    x_train = build_feature_matrix(encoder, train_df["prompt"].tolist(), tfidf_train_scores)
    y_train = train_df["label"].to_numpy()
    x_valid = build_feature_matrix(encoder, valid_df["prompt"].tolist(), tfidf_valid_scores)
    y_valid = valid_df["label"].to_numpy()

    model = build_ensemble_model()
    model.fit(x_train, y_train)

    valid_probs = model.predict_proba(x_valid)[:, 1]
    threshold = tune_threshold(y_valid, valid_probs, target_fpr=args.target_fpr)
    valid_preds = (valid_probs >= threshold.threshold).astype(int)

    print(classification_report(y_valid, valid_preds, digits=4))
    print(f"roc_auc={roc_auc_score(y_valid, valid_probs):.4f}")
    print(
        f"threshold={threshold.threshold:.4f} "
        f"fpr={threshold.fpr:.4f} tpr={threshold.tpr:.4f}"
    )

    save_joblib(tfidf_bundle, f"{args.output_dir}/tfidf_bundle.joblib")
    save_joblib(model, f"{args.output_dir}/ensemble_model.joblib")
    save_threshold(threshold, f"{args.output_dir}/threshold.joblib")


if __name__ == "__main__":
    main()
