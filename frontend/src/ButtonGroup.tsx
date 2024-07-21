import { Button, ButtonGroup } from "@mui/material";

export function ButtonGroupInput({
  options,
  selected,
  onChange,
}: {
  options: { label: string; id: string }[];
  selected?: string[];
  onChange?: (id: string) => void;
}) {
  return (
    <ButtonGroup variant="outlined" aria-label="outlined button group">
      {options.map((option) => (
        <Button
          variant={selected.includes(option.id) ? "contained" : "outlined"}
          onClick={() => onChange(option.id)}
          key={option.id}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
