"""
EchoForge — Member 1 Performance Metrics
Calculates confusion matrix, precision, recall, F1, FPR, FNR, accuracy, and EER.
Follows cybersecurity evaluation standards (Positive = Spoof/AI-Generated, Negative = Genuine/Human).
"""

import numpy as np


def compute_classification_metrics(
    y_true: list,
    y_pred: list,
    y_scores: list = None,
) -> dict:
    """
    Computes standard binary evaluation metrics.

    Args:
        y_true: list of true binary labels (1 = Fake/Spoof, 0 = Real/Bonafide).
        y_pred: list of predicted binary labels (1 = Fake/Spoof, 0 = Real/Bonafide) or strings.
        y_scores: optional list of continuous raw spoof scores for ROC / EER calculation.

    Returns:
        dict of metrics.
    """
    # Normalize string predictions if passed
    normalized_pred = []
    for p in y_pred:
        if isinstance(p, str):
            p_lower = p.lower()
            if "ai" in p_lower or "fake" in p_lower or "spoof" in p_lower or "synthetic" in p_lower:
                normalized_pred.append(1)
            elif "genuine" in p_lower or "real" in p_lower or "bonafide" in p_lower or "authentic" in p_lower:
                normalized_pred.append(0)
            else:
                normalized_pred.append(-1)  # Uncertain / Unclassified
        else:
            normalized_pred.append(int(p))

    y_t = np.array(y_true, dtype=int)
    y_p = np.array(normalized_pred, dtype=int)

    # Filter out uncertain predictions for clean binary evaluation if any
    valid_mask = y_p >= 0
    uncertain_count = int(np.sum(~valid_mask))

    if np.sum(valid_mask) == 0:
        return {
            "total_samples": len(y_true),
            "evaluated_samples": 0,
            "uncertain_samples": uncertain_count,
            "tp": 0,
            "fp": 0,
            "tn": 0,
            "fn": 0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "fpr": 0.0,
            "fnr": 0.0,
            "accuracy": 0.0,
        }

    y_t_eval = y_t[valid_mask]
    y_p_eval = y_p[valid_mask]

    tp = int(np.sum((y_t_eval == 1) & (y_p_eval == 1)))
    fp = int(np.sum((y_t_eval == 0) & (y_p_eval == 1)))
    tn = int(np.sum((y_t_eval == 0) & (y_p_eval == 0)))
    fn = int(np.sum((y_t_eval == 1) & (y_p_eval == 0)))

    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float(2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
    accuracy = float((tp + tn) / len(y_t_eval)) if len(y_t_eval) > 0 else 0.0

    metrics = {
        "total_samples": len(y_true),
        "evaluated_samples": int(len(y_t_eval)),
        "uncertain_samples": uncertain_count,
        "confusion_matrix": {
            "true_positives (spoof detected as spoof)": tp,
            "false_positives (genuine flagged as spoof)": fp,
            "true_negatives (genuine detected as genuine)": tn,
            "false_negatives (spoof missed as genuine)": fn,
        },
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "fpr": round(fpr, 4),
        "fnr": round(fnr, 4),
        "accuracy": round(accuracy, 4),
    }

    # Calculate EER if scores are provided
    if y_scores is not None and len(y_scores) == len(y_true):
        scores = np.array(y_scores)[valid_mask]
        labels = y_t_eval
        eer = compute_eer(labels, scores)
        if eer is not None:
            metrics["eer"] = round(eer, 4)

    return metrics


def compute_eer(labels: np.ndarray, scores: np.ndarray):
    """
    Computes Equal Error Rate (EER) where FPR == FNR.
    """
    if len(np.unique(labels)) < 2:
        return None

    thresholds = np.linspace(0.0, 1.0, 201)
    fpr_list = []
    fnr_list = []

    pos_mask = (labels == 1)
    neg_mask = (labels == 0)
    n_pos = np.sum(pos_mask)
    n_neg = np.sum(neg_mask)

    if n_pos == 0 or n_neg == 0:
        return None

    for th in thresholds:
        pred_pos = scores >= th
        fp = np.sum(pred_pos & neg_mask)
        fn = np.sum((~pred_pos) & pos_mask)
        fpr_list.append(fp / n_neg)
        fnr_list.append(fn / n_pos)

    fpr_arr = np.array(fpr_list)
    fnr_arr = np.array(fnr_list)

    # Find intersection point where abs(fpr - fnr) is minimized
    diff = np.abs(fpr_arr - fnr_arr)
    min_idx = np.argmin(diff)
    eer = (fpr_arr[min_idx] + fnr_arr[min_idx]) / 2.0
    return float(eer)
