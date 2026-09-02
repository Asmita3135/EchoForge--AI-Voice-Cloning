import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/echoforgeApi';

/**
 * Custom hook to monitor backend liveness and module health.
 * Drives connection badge states: 'checking' | 'connected' | 'unavailable'
 */
export function useHealthCheck(pollIntervalMs = 15000) {
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'connected' | 'unavailable'
  const [moduleStatus, setModuleStatus] = useState({ member1: 'checking', member2: 'checking', member3: 'checking' });
  const [errorMessage, setErrorMessage] = useState(null);

  const performCheck = useCallback(async () => {
    setHealthStatus((prev) => (prev === 'connected' ? 'connected' : 'checking'));
    
    const result = await checkHealth();

    if (result.status === 'ok') {
      setHealthStatus('connected');
      setModuleStatus(result.modules || { member1: 'ok', member2: 'ok', member3: 'ok' });
      setErrorMessage(null);
    } else {
      setHealthStatus('unavailable');
      setModuleStatus({ member1: 'error', member2: 'error', member3: 'error' });
      setErrorMessage(result.error || 'Backend service is unavailable.');
    }
  }, []);

  useEffect(() => {
    performCheck();

    if (pollIntervalMs > 0) {
      const timer = setInterval(performCheck, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [performCheck, pollIntervalMs]);

  return {
    healthStatus,
    moduleStatus,
    errorMessage,
    refetchHealth: performCheck,
  };
}
