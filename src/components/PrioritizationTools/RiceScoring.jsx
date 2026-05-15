import { useState, useCallback, useMemo } from 'react';
import './RiceScoring.css';
import {
  RICE_CONFIG,
  computeRICEScore,
  createDefaultRICEScores,
} from '../../data/priorityConfig';

/**
 * RiceScoring - RICE prioritization tool
 * FR-038: Input R/I/C/E values and see calculated scores
 */
function RiceScoring({ tasks = [], onRiceUpdate }) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editScores, setEditScores] = useState(null);

  // Tasks with RICE scores, sorted by score
  const tasksWithRice = useMemo(() => {
    return tasks
      .filter((t) => t.riceScores)
      .map((t) => ({
        ...t,
        riceScore: computeRICEScore(t.riceScores),
      }))
      .sort((a, b) => b.riceScore - a.riceScore);
  }, [tasks]);

  // Tasks without RICE scores
  const tasksWithoutRice = useMemo(() => {
    return tasks.filter((t) => !t.riceScores);
  }, [tasks]);

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId);
    setEditScores(task?.riceScores || createDefaultRICEScores());
  }, [tasks]);

  const handleScoreChange = useCallback((field, value) => {
    setEditScores((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedTaskId || !editScores) return;
    await onRiceUpdate?.(selectedTaskId, editScores);
    setSelectedTaskId(null);
    setEditScores(null);
  }, [selectedTaskId, editScores, onRiceUpdate]);

  const handleCancel = useCallback(() => {
    setSelectedTaskId(null);
    setEditScores(null);
  }, []);

  const currentScore = editScores ? computeRICEScore(editScores) : 0;

  return (
    <div className="rice-scoring">
      <header className="rice-scoring__header">
        <h3 className="rice-scoring__title">
          <span className="rice-scoring__icon" aria-hidden="true">📊</span>
          RICE Scoring
        </h3>
        <p className="rice-scoring__description">
          Reach × Impact × Confidence ÷ Effort
        </p>
      </header>

      {/* Task selector */}
      {!selectedTaskId && (
        <div className="rice-scoring__selector">
          <label className="rice-scoring__selector-label">
            Select a task to score:
          </label>
          <select
            className="rice-scoring__select"
            value=""
            onChange={(e) => handleSelectTask(e.target.value)}
          >
            <option value="" disabled>Choose a task...</option>
            {tasksWithoutRice.length > 0 && (
              <optgroup label="Unscored">
                {tasksWithoutRice.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </optgroup>
            )}
            {tasksWithRice.length > 0 && (
              <optgroup label="Already Scored">
                {tasksWithRice.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} (Score: {t.riceScore.toFixed(1)})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Score editor */}
      {selectedTaskId && editScores && (
        <div className="rice-scoring__editor">
          <div className="rice-scoring__task-name">
            {tasks.find((t) => t.id === selectedTaskId)?.title}
          </div>

          <div className="rice-scoring__fields">
            {Object.entries(RICE_CONFIG).map(([field, config]) => (
              <div key={field} className="rice-scoring__field">
                <label className="rice-scoring__field-label">
                  {config.label}
                  <span className="rice-scoring__field-hint">{config.description}</span>
                </label>
                <div className="rice-scoring__field-input-wrapper">
                  <input
                    type="range"
                    className="rice-scoring__slider"
                    min={config.min}
                    max={config.max}
                    step={field === 'confidence' ? 0.1 : 1}
                    value={editScores[field]}
                    onChange={(e) => handleScoreChange(field, e.target.value)}
                  />
                  <span className="rice-scoring__field-value">
                    {field === 'confidence'
                      ? `${(editScores[field] * 100).toFixed(0)}%`
                      : editScores[field]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rice-scoring__result">
            <span className="rice-scoring__result-label">RICE Score:</span>
            <span className="rice-scoring__result-value">
              {currentScore.toFixed(1)}
            </span>
          </div>

          <div className="rice-scoring__actions">
            <button
              className="rice-scoring__btn rice-scoring__btn--primary"
              onClick={handleSave}
            >
              Save Score
            </button>
            <button
              className="rice-scoring__btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scored tasks leaderboard */}
      {tasksWithRice.length > 0 && !selectedTaskId && (
        <div className="rice-scoring__leaderboard">
          <h4 className="rice-scoring__leaderboard-title">Ranked by RICE</h4>
          <div className="rice-scoring__leaderboard-list">
            {tasksWithRice.slice(0, 5).map((task, index) => (
              <div
                key={task.id}
                className="rice-scoring__leaderboard-item"
                onClick={() => handleSelectTask(task.id)}
              >
                <span className="rice-scoring__leaderboard-rank">{index + 1}</span>
                <span className="rice-scoring__leaderboard-title-text">
                  {task.title}
                </span>
                <span className="rice-scoring__leaderboard-score">
                  {task.riceScore.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RiceScoring;
