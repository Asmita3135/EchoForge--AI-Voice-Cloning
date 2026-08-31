"""
Unit tests for Member 4 Configuration (M4.3).
Verifies presence, exact values, and logical consistency of all Section G-J constants.
"""
import config


def test_normalization_anchors():
    assert hasattr(config, "SPEAKER_SAME_T")
    assert hasattr(config, "SPEAKER_DIFF_T")
    assert config.SPEAKER_SAME_T == 0.65
    assert config.SPEAKER_DIFF_T == 0.55
    assert config.SPEAKER_SAME_T > config.SPEAKER_DIFF_T


def test_risk_weights():
    assert hasattr(config, "RISK_WEIGHTS")
    weights = config.RISK_WEIGHTS
    assert weights == {
        "deepfake_risk": 0.5,
        "speaker_mismatch_risk": 0.3,
        "context_risk": 0.2,
    }
    assert pytest_approx(sum(weights.values()), 1.0)


def test_decision_thresholds():
    assert hasattr(config, "HIGH_THRESHOLD")
    assert hasattr(config, "LOW_THRESHOLD")
    assert hasattr(config, "BOUNDARY_MARGIN")
    assert hasattr(config, "RELIABILITY_FLOOR")

    assert config.HIGH_THRESHOLD == 65.0
    assert config.LOW_THRESHOLD == 35.0
    assert config.BOUNDARY_MARGIN == 5.0
    assert config.RELIABILITY_FLOOR == 40.0

    assert config.HIGH_THRESHOLD > config.LOW_THRESHOLD
    assert config.BOUNDARY_MARGIN > 0
    assert 0 <= config.RELIABILITY_FLOOR <= 100


def test_reliability_parameters():
    # Availability
    assert config.RELIABILITY_MEMBER1_AVAIL == 15.0
    assert config.RELIABILITY_MEMBER3_AVAIL == 10.0
    assert config.RELIABILITY_MEMBER2_AVAIL == 15.0
    assert config.RELIABILITY_MEMBER2_SKIPPED_CAP == 25.0
    assert (
        config.RELIABILITY_MEMBER1_AVAIL
        + config.RELIABILITY_MEMBER3_AVAIL
        + config.RELIABILITY_MEMBER2_AVAIL
    ) == 40.0

    # Quality
    assert config.RELIABILITY_DURATION_PTS == 10.0
    assert config.RELIABILITY_NO_CLIPPING_PTS == 8.0
    assert config.RELIABILITY_NOT_SILENT_PTS == 7.0
    assert config.RELIABILITY_SNR_MAX_PTS == 10.0
    assert config.RELIABILITY_SNR_THRESHOLD_DB == 15.0
    assert (
        config.RELIABILITY_DURATION_PTS
        + config.RELIABILITY_NO_CLIPPING_PTS
        + config.RELIABILITY_NOT_SILENT_PTS
        + config.RELIABILITY_SNR_MAX_PTS
    ) == 35.0

    # Confidence
    assert config.RELIABILITY_M1_CONF_HIGH_PTS == 10.0
    assert config.RELIABILITY_M1_CONF_MOD_PTS == 5.0
    assert config.RELIABILITY_M1_CONF_LOW_PTS == 0.0
    assert config.RELIABILITY_UNCERTAINTY_FLAG_PENALTY == -10.0
    assert config.RELIABILITY_MAX_UNCERTAINTY_PENALTY == -25.0


def pytest_approx(val, expected):
    return abs(val - expected) < 1e-6
