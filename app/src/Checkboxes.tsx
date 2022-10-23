import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

export function Checkboxes({
  options,
  onChange,
  selected,
}: {
  options: { label: JSX.Element; value: string }[];
  onChange: (value: string) => void;
  selected: string[];
}) {
  return (
    <FormGroup>
      {options.map((opt, i) => (
        <FormControlLabel
          key={i}
          control={<Checkbox />}
          onChange={(e) => {
            onChange(opt.value);
          }}
          label={opt.label}
          checked={selected.includes(opt.value)}
        />
      ))}
    </FormGroup>
  );
}
