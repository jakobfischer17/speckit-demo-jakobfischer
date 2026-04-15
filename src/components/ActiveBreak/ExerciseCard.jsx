import './ExerciseCard.css'

function ExerciseCard({ exercise, completed, onClick }) {
  return (
    <button
      className={`exercise-card ${completed ? 'exercise-card--completed' : ''}`}
      onClick={onClick}
    >
      <span className="exercise-card__name">{exercise.name}</span>
      <span className={`exercise-card__badge exercise-card__badge--${exercise.category.toLowerCase()}`}>
        {exercise.category}
      </span>
      <span className="exercise-card__target">
        {exercise.targetValue} {exercise.targetType === 'reps' ? 'reps' : 's'}
      </span>
      {completed && <span className="exercise-card__check" aria-label="Completed">✓</span>}
    </button>
  )
}

export default ExerciseCard
