import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export function SelectInput({
  options,
  selected,
  onChange,
  label,
}: {
  options: { label: string; id: string }[];
  selected?: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id={label?.replace(" ", "-")}>{label}</InputLabel>
      <Select
        labelId={label?.replace(" ", "-")}
        value={selected}
        label="Age"
        onChange={(e) => onChange(e.target.value as string)}
      >
        {options.map((opt, i) => (
          <MenuItem key={opt.id || opt.label || i} value={opt.id}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
