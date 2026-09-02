/**
 * Centralized API Service for EchoForge Backend.
 * Strictly adheres to backend API contract and environment configuration.
 * All fetch calls live here and nowhere else in the codebase.
 */

const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url) {
    console.warn('VITE_API_BASE_URL is not set. Defaulting to http://127.0.0.1:8000');
    return 'http://127.0.0.1:8000';
  }
  // Trim trailing slashes for clean concatenation
  return url.replace(/\/+$/, '');
};

const CORS_ERROR_MESSAGE = 
  "Could not reach the analysis backend. If you're running the frontend and backend on different ports, the backend needs CORS enabled to allow browser requests — this is a backend-side configuration issue, not something fixable from the frontend.";

/**
 * Perform liveness check on GET /health.
 * @returns {Promise<{ status: string, modules?: object, error?: string }>}
 */
export async function checkHealth() {
  const baseUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { 
        status: 'error', 
        error: `Health check failed with HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    return {
      status: data.status === 'ok' ? 'ok' : 'error',
      modules: data.modules || {},
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { status: 'error', error: 'Health check request timed out after 8s.' };
    }
    // Network or CORS failure
    return { 
      status: 'error', 
      isNetworkError: true,
      error: CORS_ERROR_MESSAGE 
    };
  }
}

/**
 * Submit target audio (and optional reference audio) for forensic analysis.
 * @param {File} audioFile - Primary audio under investigation (Required)
 * @param {File|null} referenceAudioFile - Claimed speaker reference audio (Optional)
 * @returns {Promise<object>} Parsed backend response schema
 */
export async function analyzeAudio(audioFile, referenceAudioFile = null) {
  const baseUrl = getApiBaseUrl();

  if (!audioFile) {
    throw new Error('Primary target audio file is required for analysis.');
  }

  const formData = new FormData();
  formData.append('audio', audioFile, audioFile.name);

  if (referenceAudioFile) {
    formData.append('reference_audio', referenceAudioFile, referenceAudioFile.name);
  }

  try {
    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      body: formData,
      // Do NOT manually set Content-Type header when sending FormData! Browser sets multipart boundary automatically.
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    // Handle HTTP error responses explicitly
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || '';
    } catch {
      // Body was not JSON
    }

    if (response.status === 400) {
      throw new Error(errorDetail || 'Invalid or missing audio file provided.');
    }

    if (response.status === 413) {
      throw new Error(errorDetail || 'Uploaded file exceeds maximum allowed size of 50MB.');
    }

    if (response.status === 422) {
      throw new Error('The audio form field was omitted or formatted invalidly.');
    }

    if (response.status === 500) {
      throw new Error(errorDetail || 'An internal server error occurred while processing the audio analysis.');
    }

    // Generic fallback for other status codes
    throw new Error(errorDetail || `Analysis request failed with status code ${response.status}.`);

  } catch (err) {
    // If it's already an Error object from our status checks above, rethrow
    if (err.message && !err.name?.includes('TypeError') && err.message !== 'Failed to fetch') {
      throw err;
    }

    // Network level, offline, or CORS failure
    const customError = new Error(CORS_ERROR_MESSAGE);
    customError.isCorsOrNetwork = true;
    throw customError;
  }
}
