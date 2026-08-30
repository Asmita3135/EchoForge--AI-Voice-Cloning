"""
Evaluation package for EchoForge Member 1.
"""

from .metrics import compute_classification_metrics
from .robustness_tests import generate_perturbations, run_robustness_evaluation

__all__ = [
    "compute_classification_metrics",
    "generate_perturbations",
    "run_robustness_evaluation",
]
