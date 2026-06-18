/**
 * Audio track configurations for Focus Enhancement Suite.
 * Contains binaural beat presets and ambient track references.
 */

/**
 * Binaural beat presets with frequency configurations.
 * Each beat is created by playing two slightly different frequencies
 * in each ear, causing the brain to perceive the difference as a beat.
 */
export const BINAURAL_PRESETS = [
  {
    id: 'alpha-focus',
    name: 'Alpha Waves',
    description: 'Relaxed alertness • Best for creative work and learning',
    beatFrequency: 10, // 10 Hz - Alpha waves
    baseFrequency: 200,
    icon: '🧠',
    color: '#667eea',
  },
  {
    id: 'theta-deep',
    name: 'Theta Waves',
    description: 'Deep relaxation • Best for meditation and insight',
    beatFrequency: 6, // 6 Hz - Theta waves
    baseFrequency: 200,
    icon: '🌊',
    color: '#764ba2',
  },
  {
    id: 'gamma-intense',
    name: 'Gamma Waves',
    description: 'High focus • Best for complex problem solving',
    beatFrequency: 40, // 40 Hz - Gamma waves
    baseFrequency: 200,
    icon: '⚡',
    color: '#f56565',
  },
];

/**
 * Ambient tracks from YouTube for focus and relaxation.
 * Using popular royalty-free/creative commons focus music.
 */
export const AMBIENT_TRACKS = [
  {
    id: 'lofi-beats',
    name: 'Lo-fi Beats',
    description: 'Chill hip-hop beats for studying and focus',
    youtubeId: 'jfKfPfyJRdk', // Lofi Girl - beats to relax/study to
    fallbackIds: ['4xDzrJKXOOY', 'rPjez8z61rI'], // alternate lofi streams
    icon: '🎧',
    color: '#48bb78',
  },
  {
    id: 'nature-sounds',
    name: 'Rain & Thunder',
    description: 'Calming rain sounds for concentration',
    youtubeId: 'mPZkdNFkNps', // Relaxing rain sounds
    fallbackIds: ['yIQd2Ya0Ziw', 'q76bMs-NwRk'], // alternate rain/nature
    icon: '🌧️',
    color: '#4299e1',
  },
  {
    id: 'ambient-piano',
    name: 'Ambient Piano',
    description: 'Soft piano music for peaceful focus',
    youtubeId: 'hDgtxlEX2uw', // Soft piano music
    fallbackIds: ['lFcSrYw-ARY', 'XULUBg_ZcAU'], // alternate piano
    icon: '🎹',
    color: '#ed8936',
  },
];

/**
 * Get all audio tracks
 */
export function getAllTracks() {
  return {
    binaural: BINAURAL_PRESETS,
    ambient: AMBIENT_TRACKS,
  };
}

/**
 * Get a specific binaural preset by ID
 */
export function getBinauralPreset(id) {
  return BINAURAL_PRESETS.find(preset => preset.id === id);
}

/**
 * Get a specific ambient track by ID
 */
export function getAmbientTrack(id) {
  return AMBIENT_TRACKS.find(track => track.id === id);
}

/**
 * Default export for convenience
 */
export default {
  binaural: BINAURAL_PRESETS,
  ambient: AMBIENT_TRACKS,
};
