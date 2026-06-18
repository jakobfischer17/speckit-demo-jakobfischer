/**
 * Loader for the YouTube IFrame Player API.
 *
 * The API is loaded once and shared. Using the IFrame API (rather than a plain
 * <iframe>) lets us listen for playback errors (codes 2, 5, 100, 101, 150 –
 * private/removed/embedding-disabled videos) so the player can fall back to an
 * alternate video when the requested one is unavailable.
 */

const API_SRC = 'https://www.youtube.com/iframe_api';

let apiPromise = null;

/**
 * Load (or reuse) the YouTube IFrame API.
 * @returns {Promise<typeof window.YT>} Resolves with the YT namespace.
 */
export function loadYouTubeAPI() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API unavailable outside the browser'));
  }

  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise((resolve, reject) => {
    // Chain onto any existing ready callback so we don't clobber it.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') {
        try {
          previous();
        } catch {
          // Ignore errors from a pre-existing handler.
        }
      }
      resolve(window.YT);
    };

    const existing = document.querySelector(`script[src="${API_SRC}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.src = API_SRC;
      script.async = true;
      script.onerror = () => {
        apiPromise = null;
        reject(new Error('Failed to load the YouTube IFrame API'));
      };
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

/**
 * Build the ordered list of candidate video IDs for a track: the primary id
 * first, then any declared fallbacks (de-duplicated).
 * @param {Object} track
 * @returns {string[]}
 */
export function getCandidateIds(track) {
  if (!track) return [];
  const ids = [track.youtubeId, ...(track.fallbackIds || [])].filter(Boolean);
  return [...new Set(ids)];
}
