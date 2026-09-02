/**
 * Central helper for formatting risk values according to strict null-handling rules.
 * Rule: Null/undefined values MUST render as "Unavailable" — NEVER 0, NEVER empty, NEVER omitted.
 */

/**
 * Formats a risk score (0 - 100 range expected from backend) or null.
 * @param {number|null|undefined} score 
 * @returns {string} e.g. "45.2%" or "Unavailable"
 */
export function formatRiskScore(score) {
  if (score === null || score === undefined || typeof score !== 'number' || isNaN(score)) {
    return 'Unavailable';
  }
  return `${score.toFixed(1)}%`;
}

/**
 * Formats a 0-1 probability score (e.g. raw_score, similarity) or null.
 * @param {number|null|undefined} score 
 * @returns {string} e.g. "87.4%" or "Unavailable"
 */
export function formatProbabilityScore(score) {
  if (score === null || score === undefined || typeof score !== 'number' || isNaN(score)) {
    return 'Unavailable';
  }
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Provides human-readable explanatory notes for null risk breakdown fields based on evidence status.
 * @param {string} riskType - 'deepfake_risk' | 'speaker_mismatch_risk' | 'context_risk'
 * @param {object} evidence - the full evidence object from backend response
 * @returns {string} Explanatory context string
 */
export function getNullRiskExplanation(riskType, evidence) {
  if (riskType === 'speaker_mismatch_risk') {
    const status = evidence?.member2?.status;
    if (status === 'skipped') {
      return 'Speaker verification was skipped because no reference audio was provided — this is an expected state when reference audio is omitted.';
    }
    if (status === 'error') {
      return 'Speaker verification module failed to produce a valid score for this audio input.';
    }
  }

  if (riskType === 'deepfake_risk') {
    const status = evidence?.member1?.status;
    if (status === 'error') {
      return 'Deepfake detection module failed to produce a valid score for this audio input.';
    }
    if (status === 'skipped') {
      return 'Deepfake detection module was skipped.';
    }
  }

  if (riskType === 'context_risk') {
    const status = evidence?.member3?.status;
    if (status === 'error') {
      return 'Context analysis module failed to produce a valid score for this audio input.';
    }
    if (status === 'skipped') {
      return 'Context analysis module was skipped.';
    }
  }

  return 'Metric unavailable for this analysis run.';
}

/**
 * Formats file duration in seconds into M:SS format.
 * @param {number|null|undefined} seconds 
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || typeof seconds !== 'number' || isNaN(seconds)) {
    return 'N/A';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Formats bytes to readable size (KB/MB).
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
