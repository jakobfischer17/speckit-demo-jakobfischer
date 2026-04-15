export const breathingPatterns = {
  box: {
    name: 'Box Breathing',
    description: 'Equal time for inhale, hold, exhale, and hold. Great for focus and calm.',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe In' },
      { name: 'hold', duration: 4, instruction: 'Hold' },
      { name: 'exhale', duration: 4, instruction: 'Breathe Out' },
      { name: 'hold', duration: 4, instruction: 'Hold' },
    ],
  },
  relax: {
    name: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8. Promotes relaxation and sleep.',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe In' },
      { name: 'hold', duration: 7, instruction: 'Hold' },
      { name: 'exhale', duration: 8, instruction: 'Breathe Out' },
    ],
  },
  energize: {
    name: 'Energizing Breath',
    description: 'Quick inhale and exhale cycles to boost energy.',
    phases: [
      { name: 'inhale', duration: 2, instruction: 'Breathe In' },
      { name: 'exhale', duration: 2, instruction: 'Breathe Out' },
    ],
  },
}
