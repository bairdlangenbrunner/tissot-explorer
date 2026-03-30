import { useState, useEffect, useRef } from 'react';
import { projections } from '../lib/projections';

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ProjectionPicker({ activeIndex, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClick(e: MouseEvent) {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  return (
    <div className="controls">
      {/* Desktop: all buttons visible */}
      <div className="controls-grid controls-desktop">
        {projections.map((p, i) => (
          <button
            key={p.name}
            className={i === activeIndex ? 'active' : ''}
            onClick={() => onSelect(i)}
          >
            {p.name}
          </button>
        ))}
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
            {expanded ? 'Less' : 'More'}
            <span className={`toggle-arrow ${expanded ? 'open' : ''}`}>&#9662;</span>
          </button>
        </div>
        {expanded && (
          <div className="controls-dropdown">
            {projections.map((p, i) => (
              <button
                key={p.name}
                className={i === activeIndex ? 'active' : ''}
                onClick={() => {
                  onSelect(i);
                  setExpanded(false);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
