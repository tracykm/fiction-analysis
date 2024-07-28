import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  SxProps,
  Tooltip,
} from "@mui/material";

export function Checkboxes({
  options,
  onChange,
  selected,
  sx,
}: {
  options: { label: JSX.Element; value: string; tooltip?: string }[];
  onChange: (value: string) => void;
  selected: string[];
  sx?: SxProps;
}) {
  return (
    <FormGroup sx={sx}>
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
