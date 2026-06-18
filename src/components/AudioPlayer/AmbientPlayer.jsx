import { useState, useCallback, useEffect, useRef } from 'react';
import { AMBIENT_TRACKS } from '../../data/audioTracks.js';
import { loadYouTubeAPI, getCandidateIds } from '../../utils/youtube.js';

/**
 * AmbientPlayer – embedded YouTube ambient tracks.
 *
 * Uses the YouTube IFrame Player API so playback errors (private/removed/
 * embedding-disabled videos) can be detected. When the selected video can't
 * play, the player automatically falls back to the next candidate id for that
 * track, and only surfaces an error once every candidate has been exhausted.
 */
function AmbientPlayer() {
  const [selectedTrack, setSelectedTrack] = useState(AMBIENT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [fellBack, setFellBack] = useState(false);
  const [playToken, setPlayToken] = useState(0);

  const playerRef = useRef(null);
  const mountRef = useRef(null);
  const candidatesRef = useRef([]);
  const candidateIndexRef = useRef(0);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch {
        // Player may already be torn down.
      }
    }
    playerRef.current = null;
  }, []);

  // Advance to the next candidate video; returns false when none remain.
  const tryNextCandidate = useCallback(() => {
    const next = candidateIndexRef.current + 1;
    const candidates = candidatesRef.current;
    if (next < candidates.length && playerRef.current?.loadVideoById) {
      candidateIndexRef.current = next;
      setFellBack(true);
      const videoId = candidates[next];
      playerRef.current.loadVideoById({ videoId });
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;

    let cancelled = false;
    candidatesRef.current = getCandidateIds(selectedTrack);
    candidateIndexRef.current = 0;

    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        const firstId = candidatesRef.current[0];
        playerRef.current = new YT.Player(mountRef.current, {
          videoId: firstId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: firstId, // required for single-video loop
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              try {
                event.target.playVideo();
              } catch {
                // Autoplay may be blocked; user can press play in the embed.
              }
            },
            onError: () => {
              // Unavailable video → try the next source, else report failure.
              if (!tryNextCandidate()) {
                setLoadError(true);
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      destroyPlayer();
    };
    // playToken forces a fresh mount node / player per play attempt.
  }, [isPlaying, selectedTrack, playToken, destroyPlayer, tryNextCandidate]);

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    setLoadError(false);
    setFellBack(false);
  };

  const handlePlay = useCallback(() => {
    setLoadError(false);
    setFellBack(false);
    setPlayToken((t) => t + 1);
    setIsPlaying(true);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setFellBack(false);
    setPlayToken((t) => t + 1);
    setIsPlaying(true);
  }, []);

  return (
    <div className="ambient-player">
      <div className="ambient-info">
        <p className="ambient-description">
          Ambient music and nature sounds to help you focus.
          Select a track and click play to start.
        </p>
      </div>

      <div className="track-grid">
        {AMBIENT_TRACKS.map((track) => (
          <button
            key={track.id}
            className={`track-button ${selectedTrack.id === track.id ? 'active' : ''}`}
            onClick={() => handleTrackSelect(track)}
            style={{ '--track-color': track.color }}
            aria-pressed={selectedTrack.id === track.id}
          >
            <span className="track-icon" aria-hidden="true">{track.icon}</span>
            <span className="track-name">{track.name}</span>
          </button>
        ))}
      </div>

      <div className="selected-track-info">
        <p className="track-description">{selectedTrack.description}</p>
      </div>

      {loadError && (
        <div className="audio-error" role="alert">
          <p>⚠️ Unable to load this track</p>
          <p className="error-hint">
            Every available source for this track is unavailable right now.
            Try again, or pick a different track.
          </p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      <div className="ambient-controls">
        {!isPlaying ? (
          <button
            className="play-button"
            onClick={handlePlay}
            aria-label={`Play ${selectedTrack.name}`}
          >
            <span className="play-icon" aria-hidden="true">▶️</span>
            <span>Play {selectedTrack.name}</span>
          </button>
        ) : (
          <button
            className="play-button playing"
            onClick={handleStop}
            aria-label={`Stop ${selectedTrack.name}`}
          >
            <span className="play-icon" aria-hidden="true">⏹️</span>
            <span>Stop</span>
          </button>
        )}
      </div>

      {isPlaying && !loadError && (
        <div className="youtube-embed" key={`embed-${playToken}`}>
          {/* The YouTube IFrame API replaces this node with the player iframe. */}
          <div ref={mountRef} className="youtube-embed__mount" />
          {fellBack && (
            <p className="embed-note" role="status">
              The first source was unavailable — switched to an alternate track.
            </p>
          )}
          <p className="embed-note">
            Adjust volume using the YouTube player controls
          </p>
        </div>
      )}

      {!isPlaying && (
        <div className="preview-placeholder">
          <div className="preview-icon" aria-hidden="true">
            {selectedTrack.icon}
          </div>
          <p className="preview-text">Click play to start {selectedTrack.name}</p>
        </div>
      )}
    </div>
  );
}

export default AmbientPlayer;
