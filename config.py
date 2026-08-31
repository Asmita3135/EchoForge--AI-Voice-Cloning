"""
EchoForge — Member 4 Central Configuration Module.
Contains all Member-4-owned risk weights, decision thresholds, boundary margins,
normalization anchors, and reliability point allocations.
No magic numbers inline in business logic files.
"""

# =============================================================================
# 1. NORMALIZATION ANCHORS (Section G / Section B.2)
# =============================================================================
# Anchored to Member 2's actual code thresholds (verify_speaker.py: 0.6000 ± 0.0500)
# similarity >= 0.65 -> "SAME SPEAKER" (risk <= 20)
# similarity <= 0.55 -> "DIFFERENT SPEAKER" (risk >= 70)
SPEAKER_SAME_T: float = 0.65
SPEAKER_DIFF_T: float = 0.55


# =============================================================================
# 2. RISK WEIGHTS (Section I)
# =============================================================================
# MVP channel weights for available-channel weighted averaging:
# - deepfake_risk (0.5): Primary purpose-built classifier with acoustic diagnostics.
# - speaker_mismatch_risk (0.3): Secondary verification, depends on reference audio.
# - context_risk (0.2): Keyword/phrase-based suspicion score.
RISK_WEIGHTS: dict[str, float] = {
    "deepfake_risk": 0.5,
    "speaker_mismatch_risk": 0.3,
    "context_risk": 0.2,
}


# =============================================================================
# 3. DECISION ENGINE THRESHOLDS & MARGINS (Section J)
# =============================================================================
# High risk decision boundary (risk >= 65 -> HIGH)
HIGH_THRESHOLD: float = 65.0

# Low risk decision boundary (risk <= 35 -> LOW)
LOW_THRESHOLD: float = 35.0

# Score margin around HIGH/LOW thresholds that forces INCONCLUSIVE decision
BOUNDARY_MARGIN: float = 5.0

# Minimum evidence reliability score required for an automated decision
RELIABILITY_FLOOR: float = 40.0


# =============================================================================
# 4. RELIABILITY ENGINE PARAMETERS (Section H)
# =============================================================================
# Availability section (40 points max)
RELIABILITY_MEMBER1_AVAIL: float = 15.0  # Member 1 valid & available
RELIABILITY_MEMBER3_AVAIL: float = 10.0  # Member 3 transcript available
RELIABILITY_MEMBER2_AVAIL: float = 15.0  # Member 2 available with reference audio
RELIABILITY_MEMBER2_SKIPPED_CAP: float = 25.0  # Availability max ceiling if Member 2 skipped

# Audio Quality section (35 points max)
RELIABILITY_DURATION_PTS: float = 10.0   # Sufficient audio duration
RELIABILITY_NO_CLIPPING_PTS: float = 8.0 # No clipping detected
RELIABILITY_NOT_SILENT_PTS: float = 7.0  # Audio not mostly silent
RELIABILITY_SNR_MAX_PTS: float = 10.0    # Max SNR bonus points
RELIABILITY_SNR_THRESHOLD_DB: float = 15.0 # SNR threshold in dB for max points

# Decision Confidence section (25 points max)
RELIABILITY_M1_CONF_HIGH_PTS: float = 10.0
RELIABILITY_M1_CONF_MOD_PTS: float = 5.0
RELIABILITY_M1_CONF_LOW_PTS: float = 0.0
RELIABILITY_UNCERTAINTY_FLAG_PENALTY: float = -10.0 # Per channel uncertainty flag
RELIABILITY_MAX_UNCERTAINTY_PENALTY: float = -25.0  # Max total penalty cap
