import { useState, useCallback, useEffect, useRef } from 'react';
import { ProjectionPicker } from './components/ProjectionPicker';
import { MapCanvas } from './components/MapCanvas';
import { AboutModal } from './components/AboutModal';
import { CentralLonSlider } from './components/CentralLonSlider';
import { projections } from './lib/projections';

export default function App() {
  const [projectionIndex, setProjectionIndex] = useState(
    () => Math.floor(Math.random() * projections.length),
  );
  const [centralLon, setCentralLon] = useState(0);
  // const [centralLat, setCentralLat] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showSize, setShowSize] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const historyRef = useRef<number[]>([]);
  const [historyLen, setHistoryLen] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleProjectionChange = useCallback((index: number) => {
    historyRef.current.push(projectionIndex);
    setHistoryLen(historyRef.current.length);
    setProjectionIndex(index);
  }, [projectionIndex]);

  const handleUndo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev !== undefined) {
      setHistoryLen(historyRef.current.length);
      setProjectionIndex(prev);
    }
  }, []);

  const handleRandom = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * projections.length);
    } while (next === projectionIndex && projections.length > 1);
    handleProjectionChange(next);
  }, [projectionIndex, handleProjectionChange]);

  // const latSupported = !!projections[projectionIndex].supportsLatRotation;

  return (
    <>
      <header>
        <h1>Projection explorer</h1>
        <span className="sub">Map projection distortion explorer</span>
        <div className="header-actions">
          {historyLen > 0 && (
            <button
              className="about-btn undo-btn"
              onClick={handleUndo}
              aria-label="Undo projection change"
              title="Undo"
            >
              <svg className="undo-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l3.5-3v2.2A6.5 6.5 0 1 1 2.5 9" />
              </svg>
            </button>
          )}
          <button className="about-btn" onClick={handleRandom}>
            random
          </button>
          <button className="about-btn" onClick={() => setAboutOpen(true)}>
            about
          </button>
        </div>
      </header>
      <ProjectionPicker
        activeIndex={projectionIndex}
        onSelect={handleProjectionChange}
        mobileExtra={
          <>
            <span className="size-toggle-label">size scaling</span>
            <button
              className={`toggle-switch${showSize ? ' on' : ''}`}
              onClick={() => setShowSize(s => !s)}
              aria-label="Toggle size scaling"
            >
              <span className="toggle-knob" />
            </button>
          </>
        }
      />
      <CentralLonSlider value={centralLon} onChange={setCentralLon} />
      {/* <CentralLonSlider
        value={latSupported ? centralLat : 0}
        onChange={setCentralLat}
        label="Central latitude"
        min={-90}
        max={90}
        disabled={!latSupported}
      /> */}
      <div className="size-toggle-row">
        <span className="size-toggle-label">size scaling</span>
        <button
          className={`toggle-switch${showSize ? ' on' : ''}`}
          onClick={() => setShowSize(s => !s)}
          aria-label="Toggle size scaling"
        >
          <span className="toggle-knob" />
        </button>
      </div>
      <MapCanvas projectionIndex={projectionIndex} centralLon={centralLon} centralLat={0} showSize={showSize} />
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        aria-label="Toggle light/dark mode"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="3" />
            <line x1="8" y1="1" x2="8" y2="3" />
            <line x1="8" y1="13" x2="8" y2="15" />
            <line x1="1" y1="8" x2="3" y2="8" />
            <line x1="13" y1="8" x2="15" y2="8" />
            <line x1="3.05" y1="3.05" x2="4.46" y2="4.46" />
            <line x1="11.54" y1="11.54" x2="12.95" y2="12.95" />
            <line x1="3.05" y1="12.95" x2="4.46" y2="11.54" />
            <line x1="11.54" y1="4.46" x2="12.95" y2="3.05" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 9.2A5.5 5.5 0 1 1 6.8 2.5a4.5 4.5 0 0 0 6.7 6.7Z" />
          </svg>
        )}
      </button>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </>
  );
}
