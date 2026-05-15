import { useState } from 'react';
import { useBinauralBeat } from '../../hooks/useBinauralBeat.js';
import { BINAURAL_PRESETS } from '../../data/audioTracks.js';

/**
 * BinauralGenerator component for playing binaural beats.
 * Allows selection of frequency presets with play/stop controls.
 * 
 * @param {Object} props
 * @param {number} props.volume - Volume level 0-1
 * @param {Function} props.onVolumeChange - Callback when volume changes
 */
function BinauralGenerator({ volume, onVolumeChange }) {
  const [selectedPreset, setSelectedPreset] = useState(BINAURAL_PRESETS[0]);
  
  const {
    isPlaying,
    error,
    play,
    pause,
    setVolume,
    setFrequencies,
  } = useBinauralBeat({
    baseFrequency: selectedPreset.baseFrequency,
    beatFrequency: selectedPreset.beatFrequency,
    volume,
  });

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setFrequencies(preset.baseFrequency, preset.beatFrequency);
  };

  // Handle play/pause toggle
  const handleTogglePlay = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  return (
    <div className="binaural-generator">
      <div className="binaural-info">
        <p className="binaural-description">
          Binaural beats are created by playing slightly different frequencies 
          in each ear. Use <strong>headphones</strong> for the full effect.
        </p>
      </div>

      <div className="preset-grid">
        {BINAURAL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-button ${selectedPreset.id === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetSelect(preset)}
            style={{ '--preset-color': preset.color }}
            aria-pressed={selectedPreset.id === preset.id}
          >
            <span className="preset-icon" aria-hidden="true">{preset.icon}</span>
            <span className="preset-name">{preset.name}</span>
            <span className="preset-freq">{preset.beatFrequency} Hz</span>
          </button>
        ))}
      </div>

      <div className="selected-preset-info">
        <p className="preset-description">{selectedPreset.description}</p>
      </div>

      {error && (
        <div className="audio-error" role="alert">
          <p>⚠️ Audio error: {error.message}</p>
          <p className="error-hint">Try clicking play again or check your browser audio settings.</p>
        </div>
      )}

      <div className="binaural-controls">
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Stop binaural beats' : 'Play binaural beats'}
        >
          {isPlaying ? (
            <>
              <span className="play-icon" aria-hidden="true">⏹️</span>
              <span>Stop</span>
            </>
          ) : (
            <>
              <span className="play-icon" aria-hidden="true">▶️</span>
              <span>Play</span>
            </>
          )}
        </button>

        <div className="volume-control">
          <label htmlFor="binaural-volume" className="volume-label">
            🔊 Volume
          </label>
          <input
            id="binaural-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          />
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {isPlaying && (
        <div className="playing-indicator" aria-live="polite">
          <div className="wave-animation">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="playing-text">
            Playing {selectedPreset.name} ({selectedPreset.beatFrequency} Hz)
          </span>
        </div>
      )}
    </div>
  );
}

export default BinauralGenerator;
