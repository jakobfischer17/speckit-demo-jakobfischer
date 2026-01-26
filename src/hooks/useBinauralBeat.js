import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioContext } from './useAudioContext.js';

/**
 * Hook for generating binaural beats using Web Audio API.
 * Creates two oscillators with slightly different frequencies
 * panned to left and right channels to create binaural effect.
 * 
 * @param {Object} config - Initial configuration
 * @param {number} config.baseFrequency - Base carrier frequency in Hz (default: 200)
 * @param {number} config.beatFrequency - Frequency difference for binaural beat (default: 10)
 * @param {number} config.volume - Volume level 0-1 (default: 0.5)
 * @returns {Object} Binaural beat controls and state
 */
export function useBinauralBeat(config = {}) {
  const {
    baseFrequency: initialBase = 200,
    beatFrequency: initialBeat = 10,
    volume: initialVolume = 0.5,
  } = config;

  const { getContext, resume } = useAudioContext();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [frequencies, setFrequencies] = useState({
    base: initialBase,
    beat: initialBeat,
  });
  const [volume, setVolumeState] = useState(initialVolume);

  // Audio node refs
  const leftOscillatorRef = useRef(null);
  const rightOscillatorRef = useRef(null);
  const leftGainRef = useRef(null);
  const rightGainRef = useRef(null);
  const leftPannerRef = useRef(null);
  const rightPannerRef = useRef(null);
  const masterGainRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    try {
      leftOscillatorRef.current?.stop();
      rightOscillatorRef.current?.stop();
    } catch {
      // Oscillators may already be stopped
    }
    
    leftOscillatorRef.current?.disconnect();
    rightOscillatorRef.current?.disconnect();
    leftGainRef.current?.disconnect();
    rightGainRef.current?.disconnect();
    leftPannerRef.current?.disconnect();
    rightPannerRef.current?.disconnect();
    masterGainRef.current?.disconnect();
    
    leftOscillatorRef.current = null;
    rightOscillatorRef.current = null;
    leftGainRef.current = null;
    rightGainRef.current = null;
    leftPannerRef.current = null;
    rightPannerRef.current = null;
    masterGainRef.current = null;
  }, []);

  // Initialize audio nodes
  const initAudio = useCallback(async () => {
    try {
      const ctx = getContext();
      if (!ctx) {
        throw new Error('AudioContext not available');
      }

      // Resume context if suspended (browser autoplay policy)
      await resume();

      // Create master gain for smooth fade in/out
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current.connect(ctx.destination);

      // Create left channel (base frequency)
      leftOscillatorRef.current = ctx.createOscillator();
      leftOscillatorRef.current.type = 'sine';
      leftOscillatorRef.current.frequency.setValueAtTime(frequencies.base, ctx.currentTime);

      leftGainRef.current = ctx.createGain();
      leftGainRef.current.gain.setValueAtTime(1, ctx.currentTime);

      leftPannerRef.current = ctx.createStereoPanner();
      leftPannerRef.current.pan.setValueAtTime(-1, ctx.currentTime);

      leftOscillatorRef.current.connect(leftGainRef.current);
      leftGainRef.current.connect(leftPannerRef.current);
      leftPannerRef.current.connect(masterGainRef.current);

      // Create right channel (base + beat frequency)
      rightOscillatorRef.current = ctx.createOscillator();
      rightOscillatorRef.current.type = 'sine';
      rightOscillatorRef.current.frequency.setValueAtTime(
        frequencies.base + frequencies.beat,
        ctx.currentTime
      );

      rightGainRef.current = ctx.createGain();
      rightGainRef.current.gain.setValueAtTime(1, ctx.currentTime);

      rightPannerRef.current = ctx.createStereoPanner();
      rightPannerRef.current.pan.setValueAtTime(1, ctx.currentTime);

      rightOscillatorRef.current.connect(rightGainRef.current);
      rightGainRef.current.connect(rightPannerRef.current);
      rightPannerRef.current.connect(masterGainRef.current);

      setIsReady(true);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Failed to initialize binaural audio:', err);
      setError(err);
      setIsReady(false);
      return false;
    }
  }, [getContext, resume, frequencies.base, frequencies.beat]);

  // Play binaural beats
  const play = useCallback(async () => {
    if (isPlaying) return;

    try {
      // Initialize if not ready
      if (!isReady) {
        const initialized = await initAudio();
        if (!initialized) return;
      }

      const ctx = getContext();
      if (!ctx) return;

      // Start oscillators
      leftOscillatorRef.current?.start();
      rightOscillatorRef.current?.start();

      // Smooth fade in
      masterGainRef.current?.gain.linearRampToValueAtTime(
        volume,
        ctx.currentTime + 0.5
      );

      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play binaural beats:', err);
      setError(err);
    }
  }, [isPlaying, isReady, initAudio, getContext, volume]);

  // Pause (fade out but keep oscillators running)
  const pause = useCallback(async () => {
    if (!isPlaying) return;

    try {
      const ctx = getContext();
      if (!ctx || !masterGainRef.current) return;

      // Smooth fade out
      masterGainRef.current.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + 0.3
      );

      // Stop oscillators after fade
      setTimeout(() => {
        cleanup();
        setIsReady(false);
      }, 350);

      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to pause binaural beats:', err);
      setError(err);
    }
  }, [isPlaying, getContext, cleanup]);

  // Stop (immediate cleanup)
  const stop = useCallback(() => {
    cleanup();
    setIsPlaying(false);
    setIsReady(false);
  }, [cleanup]);

  // Update volume
  const setVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (masterGainRef.current && isPlaying) {
      const ctx = getContext();
      if (ctx) {
        masterGainRef.current.gain.linearRampToValueAtTime(
          clampedVolume,
          ctx.currentTime + 0.1
        );
      }
    }
  }, [isPlaying, getContext]);

  // Update frequencies
  const setFrequenciesHandler = useCallback((base, beat) => {
    setFrequencies({ base, beat });

    // Update running oscillators
    if (isPlaying) {
      const ctx = getContext();
      if (ctx) {
        leftOscillatorRef.current?.frequency.linearRampToValueAtTime(
          base,
          ctx.currentTime + 0.2
        );
        rightOscillatorRef.current?.frequency.linearRampToValueAtTime(
          base + beat,
          ctx.currentTime + 0.2
        );
      }
    }
  }, [isPlaying, getContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isPlaying,
    isReady,
    error,
    volume,
    frequencies,
    
    play,
    pause,
    stop,
    setVolume,
    setFrequencies: setFrequenciesHandler,
  };
}

export default useBinauralBeat;
