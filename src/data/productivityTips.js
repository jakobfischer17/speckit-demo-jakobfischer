/**
 * Categorized productivity tips with science-backed citations.
 * Each tip includes a research reference for credibility.
 */

export const PRODUCTIVITY_CATEGORIES = [
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: '🎯',
    description: 'Techniques for sustained concentration',
  },
  {
    id: 'time',
    name: 'Time Management',
    icon: '⏰',
    description: 'Strategies for effective scheduling',
  },
  {
    id: 'health',
    name: 'Well-being',
    icon: '🧘',
    description: 'Mind and body optimization',
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: '🏠',
    description: 'Optimizing your workspace',
  },
];

export const PRODUCTIVITY_TIPS = [
  // Deep Focus Category
  {
    id: 'focus-1',
    category: 'focus',
    title: 'Practice Single-Tasking',
    content: 'Multitasking reduces productivity by up to 40%. Focus on one task at a time for optimal results.',
    citation: {
      source: 'American Psychological Association',
      year: 2019,
      title: 'Multitasking: Switching costs',
      url: 'https://www.apa.org/topics/research/multitasking',
    },
  },
  {
    id: 'focus-2',
    category: 'focus',
    title: 'Use the Pomodoro Technique',
    content: '25-minute focused work sessions with 5-minute breaks help maintain high concentration and prevent burnout.',
    citation: {
      source: 'Francesco Cirillo',
      year: 1987,
      title: 'The Pomodoro Technique',
      url: 'https://francescocirillo.com/products/the-pomodoro-technique',
    },
  },
  {
    id: 'focus-3',
    category: 'focus',
    title: 'Eliminate Distractions First',
    content: 'It takes an average of 23 minutes to refocus after an interruption. Disable notifications before deep work.',
    citation: {
      source: 'UC Irvine',
      year: 2008,
      title: 'The Cost of Interrupted Work',
      url: 'https://www.ics.uci.edu/~gmark/chi08-mark.pdf',
    },
  },
  {
    id: 'focus-4',
    category: 'focus',
    title: 'Try Binaural Beats',
    content: 'Listening to binaural beats in the alpha (8-14 Hz) or theta (4-7 Hz) range may enhance focus and creativity.',
    citation: {
      source: 'Psychology of Music',
      year: 2017,
      title: 'Effect of binaural beat on attention',
      url: 'https://journals.sagepub.com/doi/10.1177/0305735617697506',
    },
  },

  // Time Management Category
  {
    id: 'time-1',
    category: 'time',
    title: 'Eat the Frog First',
    content: 'Tackle your most challenging task first thing in the morning when willpower is highest.',
    citation: {
      source: 'Brian Tracy',
      year: 2001,
      title: 'Eat That Frog!',
      url: 'https://www.briantracy.com/blog/time-management/the-truth-about-frogs/',
    },
  },
  {
    id: 'time-2',
    category: 'time',
    title: 'Use Time Blocking',
    content: 'Schedule specific blocks of time for different tasks. This creates structure and reduces decision fatigue.',
    citation: {
      source: 'Cal Newport',
      year: 2016,
      title: 'Deep Work: Rules for Focused Success',
      url: 'https://www.calnewport.com/books/deep-work/',
    },
  },
  {
    id: 'time-3',
    category: 'time',
    title: 'Apply the Two-Minute Rule',
    content: 'If a task takes less than two minutes, do it immediately. This prevents small tasks from piling up.',
    citation: {
      source: 'David Allen',
      year: 2001,
      title: 'Getting Things Done',
      url: 'https://gettingthingsdone.com/',
    },
  },
  {
    id: 'time-4',
    category: 'time',
    title: 'Batch Similar Tasks',
    content: 'Group similar tasks together to minimize context switching and maximize efficiency.',
    citation: {
      source: 'Harvard Business Review',
      year: 2015,
      title: 'A Study of 12 Organizations',
      url: 'https://hbr.org/2015/01/the-condensed-guide-to-running-meetings',
    },
  },

  // Well-being Category
  {
    id: 'health-1',
    category: 'health',
    title: 'Take Regular Breaks',
    content: 'The brain can only focus for about 90 minutes before needing rest. Short breaks improve overall productivity.',
    citation: {
      source: 'Peretz Lavie',
      year: 1985,
      title: 'Ultradian Rhythms in Human Performance',
      url: 'https://pubmed.ncbi.nlm.nih.gov/3902035/',
    },
  },
  {
    id: 'health-2',
    category: 'health',
    title: 'Practice Box Breathing',
    content: 'Breathe in for 4 seconds, hold for 4, exhale for 4, hold for 4. This activates the parasympathetic nervous system.',
    citation: {
      source: 'Mayo Clinic',
      year: 2020,
      title: 'Stress relief from laughter and breathing',
      url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-relief/art-20044456',
    },
  },
  {
    id: 'health-3',
    category: 'health',
    title: 'Stay Hydrated',
    content: 'Even mild dehydration (1-2%) can impair cognitive function. Keep water nearby while working.',
    citation: {
      source: 'Nutrition Reviews',
      year: 2010,
      title: 'Water, hydration, and health',
      url: 'https://academic.oup.com/nutritionreviews/article/68/8/439/1841926',
    },
  },
  {
    id: 'health-4',
    category: 'health',
    title: 'Prioritize Sleep',
    content: 'Adults need 7-9 hours of sleep. Sleep deprivation significantly reduces cognitive performance and productivity.',
    citation: {
      source: 'National Sleep Foundation',
      year: 2015,
      title: 'Sleep Duration Recommendations',
      url: 'https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need',
    },
  },

  // Environment Category
  {
    id: 'env-1',
    category: 'environment',
    title: 'Optimize Lighting',
    content: 'Natural light improves alertness and mood. Position your desk near a window or use full-spectrum bulbs.',
    citation: {
      source: 'Cornell University',
      year: 2018,
      title: 'Natural Light Study',
      url: 'https://www.news.cornell.edu/stories/2018/02/study-natural-light-office-boosts-health',
    },
  },
  {
    id: 'env-2',
    category: 'environment',
    title: 'Reduce Visual Clutter',
    content: 'A cluttered workspace increases cortisol levels and decreases focus. Keep only essential items on your desk.',
    citation: {
      source: 'Princeton Neuroscience Institute',
      year: 2011,
      title: 'Interactions of Top-Down and Bottom-Up Mechanisms',
      url: 'https://www.jneurosci.org/content/31/2/587',
    },
  },
  {
    id: 'env-3',
    category: 'environment',
    title: 'Control Temperature',
    content: 'The optimal working temperature is around 70-72°F (21-22°C). Too hot or cold reduces productivity.',
    citation: {
      source: 'Cornell University',
      year: 2004,
      title: 'Temperature and Productivity Study',
      url: 'https://news.cornell.edu/stories/2004/10/warm-offices-linked-fewer-typing-errors-higher-productivity',
    },
  },
  {
    id: 'env-4',
    category: 'environment',
    title: 'Add Plants',
    content: 'Indoor plants can improve air quality and reduce stress. Studies show they boost productivity by up to 15%.',
    citation: {
      source: 'University of Exeter',
      year: 2014,
      title: 'The Relative Benefits of Green Versus Lean Office Space',
      url: 'https://www.sciencedirect.com/science/article/abs/pii/S0272494414000538',
    },
  },
];

/**
 * Get tips by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of tips in the category
 */
export function getTipsByCategory(categoryId) {
  return PRODUCTIVITY_TIPS.filter(tip => tip.category === categoryId);
}

/**
 * Get a random tip
 * @param {string|null} categoryId - Optional category filter
 * @returns {Object} Random tip
 */
export function getRandomTip(categoryId = null) {
  const tips = categoryId 
    ? getTipsByCategory(categoryId)
    : PRODUCTIVITY_TIPS;
  
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|undefined} Category object
 */
export function getCategory(categoryId) {
  return PRODUCTIVITY_CATEGORIES.find(cat => cat.id === categoryId);
}

export default {
  PRODUCTIVITY_CATEGORIES,
  PRODUCTIVITY_TIPS,
  getTipsByCategory,
  getRandomTip,
  getCategory,
};
