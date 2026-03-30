interface AboutModalProps {
  onClose: () => void;
}

export function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <p>
          Projection explorer is an interactive tool for visualizing how map
          projections distort the Earth's surface. Every flat map introduces
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
          <dt>h (meridian scale)</dt>
          <dd>
            Scale factor along north-south lines. A value of 1.0 means no
            stretching; higher values mean the map is stretched vertically.
          </dd>
          <dt>k (parallel scale)</dt>
          <dd>
            Scale factor along east-west lines. A value of 1.0 means no
            stretching; higher values mean the map is stretched horizontally.
          </dd>
          <dt>Area scale (s)</dt>
          <dd>
            How much areas are enlarged or shrunk. A value of 1.0 preserves
            area; equal-area projections keep this at 1.0 everywhere.
          </dd>
          <dt>Max angular distortion (&omega;)</dt>
          <dd>
            The worst-case angle deformation at a point. Conformal projections
            (like Mercator or stereographic) keep this at 0&deg; everywhere,
            preserving local shapes at the cost of area distortion.
          </dd>
        </dl>
        <h3>Try it</h3>
        <p>
          Switch between projections using the buttons above the map. Each
          projection makes different trade-offs. Compare Mercator's shape
          preservation with Mollweide's area preservation, or see how the
          orthographic globe shows minimal distortion near its center.
        </p>
      </div>
    </div>
  );
}
