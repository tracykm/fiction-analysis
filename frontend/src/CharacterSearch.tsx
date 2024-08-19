import { Autocomplete, ListItem, Stack, TextField } from "@mui/material";
import { useDataContext } from "./DataContext";
import { sortBy, uniq } from "lodash-es";

export function CharacterSearch({
  value,
  onChange,
  multiple,
}: {
  value: string | string[];
  onChange: (e, opt) => void;
  multiple?: boolean;
}) {
  const { characters } = useDataContext();
  const charterOptions = sortBy(
    Object.keys(characters),
    (c) => characters[c].count * -1
  );
  return (
    <Autocomplete
      multiple={multiple}
      value={value}
      onChange={onChange}
      options={charterOptions}
      renderInput={(params) => (
        <TextField label="Search characters" {...params} />
      )}
      renderOption={(props, key) => {
        return (
          <ListItem {...props}>
            <Stack direction="row" gap={1} sx={{ width: "100%" }}>
              <div style={{ whiteSpace: "nowrap" }}>{key}</div>
              <div
                style={{
                  opacity: 0.3,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {uniq(characters[key]?.category).join(", ")}
              </div>
              <div style={{ flexGrow: 1 }} />
              <div style={{ opacity: 0.3, whiteSpace: "nowrap" }}>
                {characters[key]?.count} References
              </div>
            </Stack>
          </ListItem>
        );
      }}
    />
  );
}
