import { useEffect, useRef } from 'react';
import { projections } from '../lib/projections';

interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <p>
          Projection explorer is an interactive tool for visualizing how map
          projections distort the Earth's surface. Explore {projections.length} projections
          across six categories. Every flat map introduces
          distortion: shapes get stretched, areas change, and angles bend.
          This tool makes that distortion visible.
        </p>
        <h3>How it works</h3>
        <p>
          Hover over the map to see a <strong>Tissot indicatrix</strong>, a
          small ellipse that shows how a circle on the globe would appear
          under the current projection. A perfect circle means no local
          distortion; the more elongated or enlarged the ellipse, the greater
          the distortion at that point.
        </p>
        <h3>What the metrics mean</h3>
        <dl>
          <dt>Area distortion</dt>
          <dd>
            How much areas are enlarged or shrunk. A value of 1.0 preserves
            area; equal-area projections keep this at 1.0 everywhere.
          </dd>
          <dt>Angular distortion</dt>
          <dd>
            The worst-case angle deformation at a point. Conformal projections
            (like Mercator or stereographic) keep this at 0&deg; everywhere,
            preserving local shapes at the cost of area distortion.
          </dd>
        </dl>
        <h3>Controls</h3>
        <dl>
          <dt>Projection buttons</dt>
          <dd>
            Switch between projections grouped by type (conformal, equal-area,
            compromise, equidistant, azimuthal, and other). Each makes different
            trade-offs.
          </dd>
          <dt>Random</dt>
          <dd>Jump to a random projection.</dd>
          <dt>Central longitude</dt>
          <dd>
            Drag the slider to re-center the map on a different meridian.
          </dd>
          <dt>Size scaling</dt>
          <dd>
            On by default. The Tissot ellipse grows or shrinks relative to the
            dashed reference circle, which represents no distortion. Turn off to
            normalize the ellipse to a fixed size so you can focus on shape
            distortion alone.
          </dd>
        </dl>
      </div>
    </div>
  );
}
