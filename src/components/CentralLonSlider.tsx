interface Props {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function CentralLonSlider({
  value,
  onChange,
  label = 'Central longitude',
  min = -180,
  max = 180,
  disabled = false,
}: Props) {
  const id = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className={`central-lon${disabled ? ' disabled' : ''}`}>
      <label className="central-lon-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
      {!disabled && (
        <>
          <span className="central-lon-value">{value}°</span>
          <button
            className="central-lon-reset"
            style={{ visibility: value !== 0 ? 'visible' : 'hidden' }}
            onClick={() => onChange(0)}
          >
            reset
          </button>
        </>
      )}
    </div>
  );
}
