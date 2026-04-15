import { describe, it, expect } from 'vitest'
import { filterExercises } from './exercises'

const mockExercises = [
  { id: 'push-ups', name: 'Push-ups', category: 'Intense' },
  { id: 'desk-push-ups', name: 'Desk Push-ups', category: 'Light' },
  { id: 'shoulder-rolls', name: 'Shoulder Rolls', category: 'Light' },
  { id: 'forward-fold', name: 'Forward Fold', category: 'Stretch' },
  { id: 'burpees', name: 'Burpees', category: 'Intense' },
]

describe('filterExercises', () => {
  it('returns all exercises when category is All', () => {
    expect(filterExercises(mockExercises, 'All')).toEqual(mockExercises)
  })

  it('returns only Light exercises', () => {
    const result = filterExercises(mockExercises, 'Light')
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.category === 'Light')).toBe(true)
  })

  it('returns only Intense exercises', () => {
    const result = filterExercises(mockExercises, 'Intense')
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.category === 'Intense')).toBe(true)
  })

  it('returns only Stretch exercises', () => {
    const result = filterExercises(mockExercises, 'Stretch')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('forward-fold')
  })

  it('returns empty array when no exercises match', () => {
    const result = filterExercises(mockExercises, 'Yoga')
    expect(result).toEqual([])
  })
})
