from __future__ import annotations

import argparse

from sklearn.metrics import classification_report, roc_auc_score

from app.models.tfidf_model import build_tfidf_bundle
from training.common import save_joblib, save_threshold, split_dataset
from training.data_sources import (
    augment_jailbreak_variants,
    combine_datasets,
    load_expanded_hf_corpus,
    load_hf_jbb_behaviors,
    load_hf_oasst1_prompts,
    load_jbb_dataset,
    load_oasst1_placeholder,
)
from app.inference.threshold import tune_threshold


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train TF-IDF + Logistic Regression model.")
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

    bundle = build_tfidf_bundle()
    bundle.pipeline.fit(train_df["prompt"], train_df["label"])

    valid_probs = bundle.predict_proba(valid_df["prompt"])[:, 1]
    threshold = tune_threshold(valid_df["label"], valid_probs, target_fpr=args.target_fpr)
    valid_preds = (valid_probs >= threshold.threshold).astype(int)

    print(classification_report(valid_df["label"], valid_preds, digits=4))
    print(f"roc_auc={roc_auc_score(valid_df['label'], valid_probs):.4f}")
    print(
        f"threshold={threshold.threshold:.4f} "
        f"fpr={threshold.fpr:.4f} tpr={threshold.tpr:.4f}"
    )

    save_joblib(bundle, f"{args.output_dir}/tfidf_bundle.joblib")
    save_threshold(threshold, f"{args.output_dir}/threshold.joblib")


if __name__ == "__main__":
    main()
