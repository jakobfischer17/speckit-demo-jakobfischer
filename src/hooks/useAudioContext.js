import { useRef, useCallback, useSyncExternalStore } from 'react';

/**
 * Singleton AudioContext manager.
 * Shares a single AudioContext across all audio features.
 */

// Singleton AudioContext instance
let audioContextInstance = null;
let listeners = new Set();

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  listeners.forEach(listener => listener());
}

/**
 * Get or create the AudioContext
 */
function getAudioContext() {
  if (!audioContextInstance && typeof AudioContext !== 'undefined') {
    audioContextInstance = new AudioContext();
    
    // Handle state changes
    audioContextInstance.addEventListener('statechange', notifyListeners);
  }
  return audioContextInstance;
}

/**
 * Subscribe to AudioContext state changes
 */
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Get current AudioContext state
 */
function getSnapshot() {
  return audioContextInstance?.state || 'closed';
}

/**
 * Hook for managing shared AudioContext.
 * Handles browser autoplay policy (resume on user interaction).
 * 
 * @returns {Object} { context, state, resume, suspend }
 */
export function useAudioContext() {
  const contextRef = useRef(null);
  
  // Track state changes with useSyncExternalStore
  const state = useSyncExternalStore(subscribe, getSnapshot);

  // Get or create context
  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = getAudioContext();
    }
    return contextRef.current;
  }, []);

  // Resume context (required after user interaction)
  const resume = useCallback(async () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }, [getContext]);

  // Suspend context
  const suspend = useCallback(async () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'running') {
      await ctx.suspend();
    }
  }, [getContext]);

  return {
    context: contextRef.current || getAudioContext(),
    state,
    resume,
    suspend,
    getContext,
  };
}

export default useAudioContext;
