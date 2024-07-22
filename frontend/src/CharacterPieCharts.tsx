import { Box, Button, ButtonGroup, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import charactersData from "./data/characters.json";
import { PieChartTM } from "./PieChartTM";
import { useState } from "react";

const characters: Record<
  string,
  {
    char_count: { char_count: number; sentence: string; chapter: number }[];
    count: number;
    category?: string[];
  }
> = charactersData;

const PIE_COLORS = [
  "#25CED1",
  "#3BC0C6",
  "#51B2BB",
  "#67A5B0",
  "#7D97A5",
  "#92899B",
  "#A87B90",
  "#BE6E85",
  "#D4607A",
  "#EA526F",
];

function getPieChartDataIndividuals(types: { label: string; id: string }[]) {
  return types.map(({ label, id }, i) => {
    const colorIndex = i % types.length ? PIE_COLORS.length - i : i;
    const validChars = Object.values(characters).filter((c) =>
      c.category?.includes(id)
    );
    const amount = validChars.length;
    return {
      label,
      id,
      amount,
      color: PIE_COLORS[colorIndex],
      detail: validChars,
    };
  });
}
function getPieChartDataRefs(types: { label: string; id: string }[]) {
  return types.map(({ label, id }, i) => {
    const colorIndex = i % types.length ? PIE_COLORS.length - i : i;
    const validChars = Object.values(characters).filter((c) =>
      c.category?.includes(id)
    );
    const amount = validChars.reduce((acc, info) => acc + info.count, 0);
    return {
      label,
      id,
      amount,
      color: PIE_COLORS[colorIndex],
      detail: validChars,
    };
  });
}

const characterOptions = Object.keys(characters).map((label, i) => ({
  value: label,
  label: (
    <div key={label || i}>
      {label} <span style={{ opacity: 0.4 }}>{characters[label].count}</span>
    </div>
  ),
  count: characters[label].count,
  category: characters[label].category,
  tooltip: characters[label].category?.join(", "),
}));

characterOptions.sort((a, b) => b.count - a.count);

export function CharacterPieCharts() {
  const [countType, setCountType] = useState<"individuals" | "refs">(
    "individuals"
  );
  const getPieChartData =
    countType === "individuals"
      ? getPieChartDataIndividuals
      : getPieChartDataRefs;

  const subtitle = countType === "individuals" ? "Characters" : "References";
  return (
    <>
      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <PieChartTM
          data={getPieChartData([
            { id: "Human", label: "Human" },
            { id: "Witch", label: "Witch" },
            { id: "Angel", label: "Angel" },
            { id: "Dæmon", label: "Dæmon" },
            { id: "Mulefa", label: "Mulefa" },
            { id: "Gallivespian", label: "Gallivespian" },
            { id: "Bear", label: "Bear" },
          ])}
          name="Species"
          subtitle={subtitle}
          includeDetailPercent={countType === "refs"}
        />
        <PieChartTM
          data={getPieChartData([
            { id: "Lyra's World", label: "Lyra's World" },
            { id: "Will's World", label: "Will's World" },
            { id: "Angel", label: "Angel Realm" },
            { id: "Gallivespian", label: "Gallivespian's" },
            { id: "Citt\u00e0gazze", label: "Citt\u00e0gazze's" },
            { id: "Mulefa", label: "Mulefa's" },
          ])}
          name="Universes"
          subtitle={subtitle}
          includeDetailPercent={countType === "refs"}
        />
        <PieChartTM
          data={getPieChartData([
            { id: "Adult", label: "Adult" },
            { id: "Child", label: "Child" },
          ])}
          name="Ages"
          subtitle={subtitle}
          includeDetailPercent={countType === "refs"}
        />
      </Stack>

      <Box sx={{ width: "100%", textAlign: "center" }}>
        <ButtonGroup sx={{ mb: 2 }}>
          <Tooltip title="The number of unique characters in each category">
            <Button
              onClick={() => setCountType("individuals")}
              variant={countType === "individuals" ? "contained" : "outlined"}
            >
              By Individual
            </Button>
          </Tooltip>
          <Tooltip title="The total number of times any character in each category is referenced in the text">
            <Button
              onClick={() => setCountType("refs")}
              variant={countType === "refs" ? "contained" : "outlined"}
            >
              By References
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </>
  );
}
