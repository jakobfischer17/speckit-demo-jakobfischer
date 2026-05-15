import { useState } from 'react';
import BinauralGenerator from './BinauralGenerator.jsx';
import AmbientPlayer from './AmbientPlayer.jsx';
import './AudioPlayer.css';

/**
 * AudioPlayer container component.
 * Provides tabbed interface for binaural beats and ambient tracks.
 */
function AudioPlayer({ className = '' }) {
  const [activeTab, setActiveTab] = useState('binaural');
  const [volume, setVolume] = useState(0.5);

  return (
    <div className={`audio-player ${className}`}>
      <h2 className="section-title">
        <span className="section-title-icon" aria-hidden="true">🎵</span>
        Focus Audio
      </h2>

      <div className="audio-tabs" role="tablist" aria-label="Audio type selection">
        <button
          role="tab"
          className={`audio-tab ${activeTab === 'binaural' ? 'active' : ''}`}
          onClick={() => setActiveTab('binaural')}
          aria-selected={activeTab === 'binaural'}
          aria-controls="binaural-panel"
          id="binaural-tab"
        >
          <span aria-hidden="true">🧠</span> Binaural Beats
        </button>
        <button
          role="tab"
          className={`audio-tab ${activeTab === 'ambient' ? 'active' : ''}`}
          onClick={() => setActiveTab('ambient')}
          aria-selected={activeTab === 'ambient'}
          aria-controls="ambient-panel"
          id="ambient-tab"
        >
          <span aria-hidden="true">🎧</span> Ambient Music
        </button>
      </div>

      <div className="audio-content">
        <div
          role="tabpanel"
          id="binaural-panel"
          aria-labelledby="binaural-tab"
          hidden={activeTab !== 'binaural'}
        >
          {activeTab === 'binaural' && (
            <BinauralGenerator
              volume={volume}
              onVolumeChange={setVolume}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="ambient-panel"
          aria-labelledby="ambient-tab"
          hidden={activeTab !== 'ambient'}
        >
          {activeTab === 'ambient' && (
            <AmbientPlayer volume={volume} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
