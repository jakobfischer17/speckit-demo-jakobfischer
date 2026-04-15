import { useState } from 'react'
import { filterExercises } from '../../utils/exercises'
import ExerciseCard from './ExerciseCard'
import './ExerciseLibrary.css'

const CATEGORIES = ['All', 'Light', 'Intense', 'Stretch']

function ExerciseLibrary({ exercises, completedIds, onSelectExercise, onResetCompleted }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredExercises = filterExercises(exercises, activeFilter)
  const allFilteredCompleted = filteredExercises.length > 0 &&
    filteredExercises.every((e) => completedIds.includes(e.id))

  return (
    <div className="exercise-library">
      <h2>🏃 Active Break Exercises</h2>
      <div className="exercise-library__filters" role="group" aria-label="Filter exercises by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`exercise-library__chip ${activeFilter === cat ? 'exercise-library__chip--active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            aria-label={`Filter by ${cat}`}
            aria-pressed={activeFilter === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {allFilteredCompleted ? (
        <div className="exercise-library__congrats">
          <p>🎉 Congratulations! You completed all {activeFilter === 'All' ? '' : activeFilter + ' '}exercises!</p>
          <button
            className="exercise-library__reset-btn"
            onClick={() => onResetCompleted(activeFilter)}
          >
            Reset &amp; Go Again
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <p className="exercise-library__empty">No exercises found for this category.</p>
      ) : (
        <div className="exercise-library__grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completed={completedIds.includes(exercise.id)}
              onClick={() => onSelectExercise(exercise)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ExerciseLibrary
