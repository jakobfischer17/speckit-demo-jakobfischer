import { useState, useMemo, useCallback } from 'react';
import {
  PRODUCTIVITY_CATEGORIES,
  PRODUCTIVITY_TIPS,
  getTipsByCategory,
} from '../data/productivityTips.js';
import './ProductivityTips.css';

function ProductivityTips() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedTip, setExpandedTip] = useState(null);

  // Get filtered tips based on active category
  const displayedTips = useMemo(() => {
    if (!activeCategory) return PRODUCTIVITY_TIPS;
    return getTipsByCategory(activeCategory);
  }, [activeCategory]);

  // Handle category selection
  const handleCategoryClick = useCallback((categoryId) => {
    setActiveCategory(prev => prev === categoryId ? null : categoryId);
    setExpandedTip(null);
  }, []);

  // Handle tip expansion
  const handleTipClick = useCallback((tipId) => {
    setExpandedTip(prev => prev === tipId ? null : tipId);
  }, []);

  return (
    <div className="tips-container">
      <h1 className="tips-title">💡 Science-Backed Productivity Tips</h1>
      <p className="tips-subtitle">Evidence-based strategies to boost your focus and efficiency</p>

      {/* Category filter tabs */}
      <div className="tips-categories" role="tablist" aria-label="Tip categories">
        <button
          className={`category-tab ${!activeCategory ? 'category-tab--active' : ''}`}
          onClick={() => handleCategoryClick(null)}
          role="tab"
          aria-selected={!activeCategory}
          aria-controls="tips-grid"
        >
          <span className="category-icon">📚</span>
          <span className="category-name">All Tips</span>
          <span className="category-count">{PRODUCTIVITY_TIPS.length}</span>
        </button>
        {PRODUCTIVITY_CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'category-tab--active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            role="tab"
            aria-selected={activeCategory === category.id}
            aria-controls="tips-grid"
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-count">{getTipsByCategory(category.id).length}</span>
          </button>
        ))}
      </div>

      {/* Tips grid */}
      <div 
        id="tips-grid"
        className="tips-grid"
        role="tabpanel"
        aria-label={activeCategory 
          ? `${PRODUCTIVITY_CATEGORIES.find(c => c.id === activeCategory)?.name} tips`
          : 'All tips'
        }
      >
        {displayedTips.map((tip) => {
          const category = PRODUCTIVITY_CATEGORIES.find(c => c.id === tip.category);
          const isExpanded = expandedTip === tip.id;

          return (
            <article
              key={tip.id}
              className={`tip-card ${isExpanded ? 'tip-card--expanded' : ''}`}
              onClick={() => handleTipClick(tip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTipClick(tip.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
            >
              <div className="tip-card__header">
                <span className="tip-card__category-icon">{category?.icon}</span>
                <h3 className="tip-card__title">{tip.title}</h3>
              </div>

              <p className="tip-card__content">{tip.content}</p>

              {/* Citation - shown when expanded */}
              {tip.citation && (
                <div className={`tip-card__citation ${isExpanded ? 'tip-card__citation--visible' : ''}`}>
                  <span className="citation-label">📖 Source:</span>
                  <cite className="citation-text">
                    {tip.citation.url ? (
                      <a
                        href={tip.citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tip.citation.source} ({tip.citation.year})
                      </a>
                    ) : (
                      `${tip.citation.source} (${tip.citation.year})`
                    )}
                  </cite>
                </div>
              )}

              <div className="tip-card__footer">
                <span className="tip-card__category-label">{category?.name}</span>
                <span className="tip-card__expand-hint">
                  {isExpanded ? 'Click to collapse' : 'Click for source'}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {displayedTips.length === 0 && (
        <div className="tips-empty">
          <p>No tips found in this category.</p>
        </div>
      )}
    </div>
  );
}

export default ProductivityTips;
