import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for detecting which section is currently visible in the viewport.
 * Uses Intersection Observer for efficient scroll tracking.
 * 
 * @param {string[]} sectionIds - Array of section element IDs to observe
 * @param {Object} options - Configuration options
 * @param {number} options.rootMargin - Margin around the root (default: '-20% 0px -70% 0px')
 * @param {number} options.threshold - Visibility threshold (default: 0)
 * @returns {Object} { activeSection, scrollToSection }
 */
export function useScrollSpy(sectionIds, options = {}) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || null);
  const observerRef = useRef(null);
  
  const {
    rootMargin = '-20% 0px -70% 0px',
    threshold = 0,
  } = options;

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Track which sections are currently intersecting
    const visibleSections = new Map();

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        visibleSections.set(entry.target.id, entry.isIntersecting);
      });

      // Find the first visible section in order
      for (const id of sectionIds) {
        if (visibleSections.get(id)) {
          setActiveSection(id);
          return;
        }
      }
    };

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current.observe(element);
      }
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sectionIds, rootMargin, threshold]);

  // Smooth scroll to a section
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Optimistically set active section for immediate feedback
      setActiveSection(sectionId);
    }
  }, []);

  return {
    activeSection,
    scrollToSection,
  };
}

export default useScrollSpy;
