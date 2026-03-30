import { useState } from 'react';
import { ProjectionPicker } from './components/ProjectionPicker';
import { MapCanvas } from './components/MapCanvas';
import { AboutModal } from './components/AboutModal';

export default function App() {
  const [projectionIndex, setProjectionIndex] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <header>
        <h1>Tissot Explorer</h1>
        <span className="sub">Map projection distortion explorer</span>
        <button className="about-btn" onClick={() => setAboutOpen(true)}>
          About
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
