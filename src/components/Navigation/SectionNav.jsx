import './SectionNav.css';

/**
 * Sticky section navigation component.
 * Displays navigation links for all major sections with active state highlighting.
 * 
 * @param {Object} props
 * @param {Array} props.sections - Array of { id, label, icon } objects
 * @param {string} props.activeSection - Currently active section ID
 * @param {Function} props.onNavigate - Callback when navigation item is clicked
 */
function SectionNav({ sections, activeSection, onNavigate }) {
  const handleClick = (e, sectionId) => {
    e.preventDefault();
    onNavigate(sectionId);
  };

  const handleKeyDown = (e, sectionId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(sectionId);
    }
  };

  return (
    <nav className="section-nav" aria-label="Main navigation">
      <ul className="section-nav-list" role="list">
        {sections.map(({ id, label, icon }) => (
          <li key={id} className="section-nav-item">
            <a
              href={`#${id}`}
              className={`section-nav-link ${activeSection === id ? 'active' : ''}`}
              onClick={(e) => handleClick(e, id)}
              onKeyDown={(e) => handleKeyDown(e, id)}
              aria-current={activeSection === id ? 'true' : undefined}
              aria-label={`Navigate to ${label}`}
            >
              <span className="section-nav-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="section-nav-label">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SectionNav;
