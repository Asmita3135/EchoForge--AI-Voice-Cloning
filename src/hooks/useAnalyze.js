import { useState, useCallback } from 'react';
import { analyzeAudio } from '../services/echoforgeApi';
import { validateAudioFile } from '../utils/fileValidation';

/**
 * Custom hook to handle the complete analysis state machine.
 * States: 'idle' | 'filesReady' | 'analyzing' | 'result' | 'error'
 */
export function useAnalyze() {
  const [targetFile, setTargetFileState] = useState(null);
  const [referenceFile, setReferenceFileState] = useState(null);
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'filesReady' | 'analyzing' | 'result' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileValidationError, setFileValidationError] = useState(null);

  const setTargetFile = useCallback((file) => {
    setFileValidationError(null);
    setError(null);
    if (!file) {
      setTargetFileState(null);
      setStatus('idle');
      return;
    }

    const validation = validateAudioFile(file, 'Target Audio');
    if (!validation.valid) {
      setFileValidationError(validation.error);
      setTargetFileState(null);
      setStatus('idle');
      return;
    }

    setTargetFileState(file);
    setStatus('filesReady');
  }, []);

  const setReferenceFile = useCallback((file) => {
    setFileValidationError(null);
    if (!file) {
      setReferenceFileState(null);
      return;
    }

    const validation = validateAudioFile(file, 'Reference Audio');
    if (!validation.valid) {
      setFileValidationError(validation.error);
      setReferenceFileState(null);
      return;
    }

    setReferenceFileState(file);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!targetFile) {
      setFileValidationError('Target audio file is required to start analysis.');
      return;
    }

    setStatus('analyzing');
    setError(null);
    setResult(null);

    try {
      const responseData = await analyzeAudio(targetFile, referenceFile);
      setResult(responseData);
      setStatus('result');
    } catch (err) {
      setError({
        message: err.message || 'An unexpected error occurred during audio analysis.',
        isCorsOrNetwork: !!err.isCorsOrNetwork,
      });
      setStatus('error');
    }
  }, [targetFile, referenceFile]);

  const resetAnalysis = useCallback(() => {
    setTargetFileState(null);
    setReferenceFileState(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    setFileValidationError(null);
  }, []);

  return {
    targetFile,
    setTargetFile,
    referenceFile,
    setReferenceFile,
    status,
    result,
    error,
    fileValidationError,
    runAnalysis,
    resetAnalysis,
  };
}
