import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { projections, projectionGroups } from '../lib/projections';

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
  mobileExtra?: ReactNode;
}

function GroupLabel({ label, description, id }: { label: string; description: string; id: string }) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      (e.currentTarget as HTMLElement).blur();
    }
  }, []);

  return (
    <span className="group-label" tabIndex={0} onKeyDown={handleKeyDown} aria-describedby={id}>
      {label}
      <span className="group-tooltip" role="tooltip" id={id}>{description}</span>
    </span>
  );
}

export function ProjectionPicker({ activeIndex, onSelect, mobileExtra }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleOutside(e: Event) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchend', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchend', handleOutside);
    };
  }, [expanded]);

  // Build grouped buttons with flat-index tracking
  function renderGroups(onClickExtra?: () => void) {
    let flatIndex = 0;
    return projectionGroups.map((group) => (
      <div key={group.label} className="projection-group">
        <GroupLabel label={group.label} description={group.description} id={`tooltip-${group.label.replace(/\s+/g, '-')}`} />
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
            <div className="controls-groups">
              {(() => {
                let flatIndex = 0;
                for (const group of projectionGroups) {
                  const startIdx = flatIndex;
                  flatIndex += group.projections.length;
                  if (activeIndex >= startIdx && activeIndex < flatIndex) {
                    return (
                      <div key={group.label} className="projection-group collapsed">
                        <GroupLabel label={group.label} description={group.description} id={`tooltip-collapsed-${group.label.replace(/\s+/g, '-')}`} />
                        <div className="group-buttons">
                          <button className="active">{projections[activeIndex].name}</button>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}
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
          {mobileExtra && <div className="controls-mobile-extra">{mobileExtra}</div>}
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
