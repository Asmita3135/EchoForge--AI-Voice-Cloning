/**
 * Basic UX-level client-side validation for audio file uploads.
 * Note: The backend remains the source of truth for validation.
 */

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_AUDIO_EXTENSIONS = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.aiff', '.webm', '.wma'];

/**
 * Validates an uploaded audio file.
 * @param {File} file 
 * @param {string} fieldName - e.g. 'Target Audio' or 'Reference Audio'
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateAudioFile(file, fieldName = 'Audio file') {
  if (!file) {
    return { valid: false, error: `${fieldName} is required.` };
  }

  if (file.size === 0) {
    return { valid: false, error: `${fieldName} is empty (0 bytes).` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `${fieldName} exceeds maximum allowed size of 50MB.` };
  }

  // Sanity check extension/type
  const nameLower = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_AUDIO_EXTENSIONS.some(ext => nameLower.endsWith(ext));
  const isAudioMime = file.type ? file.type.startsWith('audio/') || file.type.includes('video/webm') || file.type.includes('octet-stream') : true;

  if (!hasAllowedExt && !isAudioMime) {
    return { 
      valid: false, 
      error: `${fieldName} must be a valid audio file (.wav, .mp3, .m4a, .flac, .ogg, .aiff, .webm).` 
    };
  }

  return { valid: true, error: null };
}
