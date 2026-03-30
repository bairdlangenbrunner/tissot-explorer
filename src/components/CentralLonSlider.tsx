interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function CentralLonSlider({ value, onChange }: Props) {
  return (
    <div className="central-lon">
      <label className="central-lon-label">Central longitude</label>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="central-lon-value">{value}°</span>
      {value !== 0 && (
        <button className="central-lon-reset" onClick={() => onChange(0)}>
          reset
        </button>
      )}
    </div>
  );
}
