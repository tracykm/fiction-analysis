import { Button, ButtonGroup } from "@mui/material";
import { Stack } from "@mui/system";
import charactersData from "./data/characters.json";
import { PieChartTM } from "./PieChartTM";

const characters: Record<
  string,
  {
    char_count: { char_count: number; sentence: string; chapter: number }[];
    count: number;
    category?: string[];
  }
> = charactersData;

function getNum(category: string) {
  return Object.values(characters).filter((c) => c.category?.includes(category))
    .length;
}
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

function getPieChartData(types: string[]) {
  return types.map((type, i) => {
    const colorIndex = i % types.length ? PIE_COLORS.length - i : i;
    return {
      label: type,
      id: type,
      amount: getNum(type),
      color: PIE_COLORS[colorIndex],
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
  return (
    <>
      <ButtonGroup sx={{ mb: 2 }}>
        <Button>Absolute</Button>
        <Button>Times Referenced</Button>
      </ButtonGroup>
      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <PieChartTM data={getPieChartData(["Adult", "Child"])} name="Ages" />
        <PieChartTM
          data={getPieChartData([
            "Lyra's World",
            "Will's World",
            "Angel",
            "Gallivespian",
            "Citt\u00e0gazze",
            "Mulefa",
          ])}
          name="Universes"
        />
        <PieChartTM
          data={getPieChartData([
            "Human",
            "Witch",
            "Angel",
            "Dæmon",
            "Mulefa",
            "Gallivespian",
            "Bear",
          ])}
          name="Species"
        />
      </Stack>
    </>
  );
}
