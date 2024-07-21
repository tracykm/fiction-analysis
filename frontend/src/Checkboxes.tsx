import { Checkbox, FormControlLabel, FormGroup, Tooltip } from "@mui/material";

export function Checkboxes({
  options,
  onChange,
  selected,
}: {
  options: { label: JSX.Element; value: string; tooltip?: string }[];
  onChange: (value: string) => void;
  selected: string[];
}) {
  return (
    <FormGroup>
      {options.map((opt, i) => (
        <Tooltip key={i} title={opt.tooltip}>
          <FormControlLabel
            key={i}
            control={<Checkbox />}
            onChange={() => {
              onChange(opt.value);
            }}
            label={opt.label}
            checked={selected.includes(opt.value)}
          />
        </Tooltip>
      ))}
    </FormGroup>
  );
}
