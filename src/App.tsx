import { useState, useCallback } from 'react';
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
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleProjectionChange = useCallback((index: number) => {
    setProjectionIndex(index);
    setCentralLon(0);
  }, []);

  const handleRandom = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * projections.length);
    } while (next === projectionIndex && projections.length > 1);
    handleProjectionChange(next);
  }, [projectionIndex, handleProjectionChange]);

  return (
    <>
      <header>
        <h1>Projection explorer</h1>
        <span className="sub">Map projection distortion explorer</span>
        <button className="about-btn" onClick={handleRandom}>
          random
        </button>
        <button className="about-btn" onClick={() => setAboutOpen(true)}>
          about
        </button>
      </header>
      <ProjectionPicker
        activeIndex={projectionIndex}
        onSelect={handleProjectionChange}
      />
      <CentralLonSlider value={centralLon} onChange={setCentralLon} />
      <MapCanvas projectionIndex={projectionIndex} centralLon={centralLon} />
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </>
  );
}
