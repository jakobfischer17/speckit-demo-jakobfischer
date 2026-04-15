export function filterExercises(exercises, category) {
  if (category === 'All') return exercises
  return exercises.filter((exercise) => exercise.category === category)
}
