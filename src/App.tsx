import { useState } from 'react';
import { ProjectionPicker } from './components/ProjectionPicker';
import { MapCanvas } from './components/MapCanvas';
import { AboutModal } from './components/AboutModal';
import { projections } from './lib/projections';

export default function App() {
  const [projectionIndex, setProjectionIndex] = useState(
    () => Math.floor(Math.random() * projections.length),
  );
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header>
        <h1>Tissot explorer</h1>
        <span className="sub">Map projection distortion explorer</span>
        <button className="about-btn" onClick={() => setAboutOpen(true)}>
          about
        </button>
      </header>
      <ProjectionPicker
        activeIndex={projectionIndex}
        onSelect={setProjectionIndex}
      />
      <MapCanvas projectionIndex={projectionIndex} />
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </>
  );
}
