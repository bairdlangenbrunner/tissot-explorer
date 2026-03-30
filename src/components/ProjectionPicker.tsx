import { projections } from '../lib/projections';

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function ProjectionPicker({ activeIndex, onSelect }: Props) {
  return (
    <div className="controls">
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
  );
}
