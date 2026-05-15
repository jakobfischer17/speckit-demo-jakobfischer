import { useState, useCallback } from 'react';
import { AMBIENT_TRACKS } from '../../data/audioTracks.js';

/**
 * AmbientPlayer component for embedded YouTube ambient tracks.
 * Uses YouTube IFrame API for playback control.
 * 
 * @param {Object} props
 * @param {number} props.volume - Volume level 0-1 (not used for YouTube, but kept for API consistency)
 */
function AmbientPlayer({ volume }) {
  const [selectedTrack, setSelectedTrack] = useState(AMBIENT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Handle track selection
  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    setLoadError(false);
  };

  // Handle play button click
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setLoadError(false);
  }, []);

  // Handle stop button click  
  const handleStop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Handle iframe load error
  const handleIframeError = useCallback(() => {
    setLoadError(true);
    setIsPlaying(false);
  }, []);

  // Build YouTube embed URL
  const getEmbedUrl = (track, autoplay = false) => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: '1',
      playlist: track.youtubeId, // Required for loop to work
      modestbranding: '1',
      rel: '0',
    });
    return `https://www.youtube.com/embed/${track.youtubeId}?${params}`;
  };

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
            The video may be unavailable or restricted. Try selecting a different track.
          </p>
          <button 
            className="retry-button"
            onClick={() => setLoadError(false)}
          >
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
        <div className="youtube-embed">
          <iframe
            title={`${selectedTrack.name} - Ambient Audio`}
            src={getEmbedUrl(selectedTrack, true)}
            width="100%"
            height="200"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleIframeError}
          />
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
