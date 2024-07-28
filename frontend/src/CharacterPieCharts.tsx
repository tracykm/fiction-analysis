import { Box, Button, ButtonGroup, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { PieChartTM } from "./PieChartTM";
import { useState } from "react";
import { CharactersData } from "./utils";
import { useDataContext } from "./DataContext";

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

function getPieChartDataIndividuals(
  characters: CharactersData,
  types: { label: string; id: string }[]
) {
  let totalAmount = 0;
  const result = types.map(({ label, id }, i) => {
    const colorIndex = i % types.length ? PIE_COLORS.length - i : i;
    const validChars = Object.values(characters).filter((c) =>
      c.category?.includes(id)
    );
    const amount = validChars.length;
    totalAmount += amount;
    return {
      label,
      id,
      amount,
      color: PIE_COLORS[colorIndex],
      detail: validChars,
    };
  });
  const charactersLength = Object.values(characters).length;
  if (charactersLength !== totalAmount) {
    result.push({
      label: "Other",
      id: "other",
      amount: charactersLength - totalAmount,
      color: PIE_COLORS[types.length],
      detail: Object.values(characters).filter(
        (c) => !types.some((t) => c.category?.includes(t.id))
      ),
    });
  }
  return result;
}
function getPieChartDataRefs(
  characters: CharactersData,
  types: { label: string; id: string }[]
) {
  let totalAmount = 0;
  const result = types.map(({ label, id }, i) => {
    const colorIndex = i % types.length ? PIE_COLORS.length - i : i;
    const validChars = Object.values(characters).filter((c) =>
      c.category?.includes(id)
    );
    const amount = validChars.reduce((acc, info) => acc + info.count, 0);
    totalAmount += amount;
    return {
      label,
      id,
      amount,
      color: PIE_COLORS[colorIndex],
      detail: validChars,
    };
  });
  const expectedTotalAmount = Object.values(characters).reduce(
    (acc, info) => acc + info.count,
    0
  );
  if (expectedTotalAmount !== totalAmount) {
    result.push({
      label: "Other",
      id: "other",
      amount: expectedTotalAmount - totalAmount,
      color: PIE_COLORS[types.length],
      detail: Object.values(characters).filter(
        (c) => !types.some((t) => c.category?.includes(t.id))
      ),
    });
  }
  return result;
}

export function CharacterPieCharts() {
  const { manualConfig, characters } = useDataContext();
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
        {manualConfig.characterCategories.map((category, i) => (
          <PieChartTM
            key={category.name}
            data={getPieChartData(characters, category.options)}
            name={category.name}
            subtitle={subtitle}
            includeDetailPercent={countType === "refs"}
            activeDirection={i == 2 ? "left" : "right"}
          />
        ))}
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
