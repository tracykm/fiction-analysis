import { useState } from "react";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { Button, Stack } from "@mui/material";
import { RelationshipModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";

export function RelationshipsOverTime() {
  const { relationships, relationshipTimelines } = useDataContext();

  const [open, setOpen] = useState(false);
  const pairs: Record<string, { from: string; to: string }[]> = {};
  Object.entries(relationshipTimelines).forEach(([fromName, to]) => {
    Object.keys(to).forEach((toName) => {
      const pairName = [fromName, toName].sort().join(" and ");
      pairs[pairName] = [
        { from: fromName, to: toName },
        { from: toName, to: fromName },
      ];
    });
  });
  const options = Object.entries(pairs).map(([label, value]) => ({
    label,
    id: label,
    value,
  }));
  const [selected, setSelected] = useState(options[0].id);

  const selectedOption = options.find((d) => d.id === selected) || options[0];

  return (
    <>
      {open && (
        <RelationshipModal
          onClose={() => setOpen(false)}
          title={selectedOption.label}
          relationship={
            relationships[selectedOption.value[0].from][
              selectedOption.value[0].to
            ]
          }
        />
      )}
      <Stack direction="row" spacing={2}>
        <SelectInput
          options={options}
          selected={selected}
          onChange={setSelected}
          label="Relationship"
        />
        <Button sx={{ whiteSpace: "nowrap" }} onClick={() => setOpen(true)}>
          Their story
        </Button>
      </Stack>
      <LineChartTM
        xScale={{ type: "linear" }}
        data={selectedOption?.value.map(({ from, to }, i) => ({
          color: i === 0 ? "#25CED1" : "#FF8A5B",
          info: relationshipTimelines[from][to].positivity,
          name: `${from}'s Feelings`,
        }))}
        keyName="chapterFlat"
        width={900}
        height={300}
      />
    </>
  );
}
