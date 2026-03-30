import { useState, useEffect, useRef } from 'react';
import { projections, projectionGroups } from '../lib/projections';

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ProjectionPicker({ activeIndex, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClick(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [expanded]);

  // Build grouped buttons with flat-index tracking
  function renderGroups(onClickExtra?: () => void) {
    let flatIndex = 0;
    return projectionGroups.map((group) => (
      <div key={group.label} className="projection-group">
        <span className="group-label">
          {group.label}
          <span className="group-tooltip">{group.description}</span>
        </span>
        <div className="group-buttons">
          {group.projections.map((p) => {
            const idx = flatIndex++;
            return (
              <button
                key={p.name}
                className={idx === activeIndex ? 'active' : ''}
                onClick={() => {
                  onSelect(idx);
                  onClickExtra?.();
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>
    ));
  }

  return (
    <div className="controls">
      {/* Desktop: grouped buttons with collapse toggle */}
      <div className="controls-desktop">
        <div className="controls-expanded">
          {desktopCollapsed ? (
            <div className="controls-collapsed-bar">
              <button className="active">{projections[activeIndex].name}</button>
            </div>
          ) : (
            <div className="controls-groups">
              {renderGroups()}
            </div>
          )}
          <button
            className="controls-toggle controls-hide-btn"
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          >
            {desktopCollapsed ? 'show' : 'hide'}
            <span className={`toggle-arrow ${desktopCollapsed ? '' : 'open'}`}>&#9662;</span>
          </button>
        </div>
      </div>

      {/* Mobile: active button + "More" toggle */}
      <div className="controls-mobile" ref={mobileRef}>
        <div className="controls-mobile-bar">
          <button className="active">
            {projections[activeIndex].name}
          </button>
          <button
            className="controls-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'less' : 'more'}
            <span className={`toggle-arrow ${expanded ? 'open' : ''}`}>&#9662;</span>
          </button>
        </div>
        {expanded && (
          <div className="controls-dropdown">
            {renderGroups(() => setExpanded(false))}
          </div>
        )}
      </div>
    </div>
  );
}
