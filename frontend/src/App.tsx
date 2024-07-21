import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import charactersData from "./data/characters.json";
import dates from "./data/dates.json";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { groupBy, keyBy } from "lodash-es";
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
  return Object.values(characters).filter((c) => c.category?.[0] === category)
    .length;
}

const categoriesPlaces = [
  {
    name: "Scholar",
    value: getNum("Scholar"),
  },
  {
    name: "Cleric",
    value: getNum("Cleric"),
  },
  {
    name: "Servant",
    value: getNum("Servant"),
  },
  {
    name: "Gyption",
    value: getNum("Gyption"),
  },
  {
    name: "Witch",
    value: getNum("Witch"),
  },
  {
    name: "Dæmon",
    value: getNum("Dæmon"),
  },
  {
    name: "Angel",
    value: getNum("Angel"),
  },
  {
    name: "Gallivespian",
    value: getNum("Gallivespian"),
  },
  {
    name: "Bear",
    value: getNum("Bear"),
  },
];

let daysSum = 0;
const dayDates = dates.map((d, i) => {
  daysSum += d.days;

  return { chapter: d.chapter, days: daysSum };
});

const CHAPTER_LENGTH = {
  1: 23,
  2: 15,
  3: 38,
};

function toFlatChapter(fullChapter: number) {
  const [book, chapter] = String(fullChapter).split(".");
  if (book === "2") return Number(chapter) + CHAPTER_LENGTH["1"];
  if (book === "3")
    return Number(chapter) + CHAPTER_LENGTH["1"] + CHAPTER_LENGTH["2"];
  return Number(chapter);
}

function chunkDataByChapter(data: typeof characters.Lyra) {
  const newData = Object.values(groupBy(data.char_count, "chapter")).map(
    (d: { chapter: number }[]) => {
      // const chapter = getPercent(d.char_count);
      const chapter = d[0].chapter;
      let days = 0;
      dayDates.forEach((dd) => {
        if (dd.chapter >= chapter) {
          days = dd.days;
        }
      });
      return {
        chapter,
        chapterFlat: toFlatChapter(chapter),
        value: d.length,
        days,
      };
    }
  );
  const keyedNewData = keyBy(newData, "chapterFlat");
  return Array.from({
    length: CHAPTER_LENGTH["1"] + CHAPTER_LENGTH["2"] + CHAPTER_LENGTH["3"],
  }).map((_, i) => {
    return {
      value: 0,
      chapterFlat: i,
      ...keyedNewData[i],
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

const categories = new Set(
  Object.values(characters).flatMap((d) => (d as any)?.category)
);

const categoryOptions = Array.from(categories).map((d) => ({
  label: d,
  id: d,
}));
const COLORS = ["#25CED1", "#FF8A5B", "#EA526F", "#FCEADE"];

function App() {
  const [selected, setSelected] = useState(["Lyra"]);
  const [category, setCategory] = useState<string>();

  const data = selected.map((s, i) => ({
    color: COLORS[i] || "white",
    name: s,
    info: chunkDataByChapter(characters[s]),
  }));

  let options = characterOptions;

  if (category) {
    options = options.filter((d) => (d as any).category?.includes(category));
  }
  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 4 }}>
      <header>
        <h1>His Dark Materials</h1>
      </header>
      <SelectInput
        options={[{ label: "All", id: "" }, ...categoryOptions]}
        selected={category}
        onChange={setCategory}
        label="Category"
      />
      {selected.join(", ")}
      {/* <PieChartTM data={categoriesPlaces} /> */}
      <Button onClick={() => setSelected([])}>Clear</Button>
      <Stack spacing={2} direction={{ sm: "row" }}>
        <LineChartTM data={data} keyName="chapterFlat" />
        <Box sx={{ height: { xs: 150, sm: 500 }, overflow: "scroll" }}>
          <Checkboxes
            onChange={(val) =>
              selected.includes(val)
                ? setSelected(selected.filter((d) => d !== val))
                : setSelected([...selected, val])
            }
            options={options}
            selected={selected}
          />
        </Box>
      </Stack>
      <Stack
        sx={{ mt: 2, width: `${100 / selected.length}%` }}
        spacing={2}
        direction="row"
      >
        {selected.map((name, i) => (
          <div key={name || i} style={{ width: "100%" }}>
            <div style={{ color: COLORS[i] }}>{name}</div>
            {characters[name].count}
            {characters[name].char_count.map((l, i) => (
              <TextPreview key={i} sentence={l.sentence} chapter={l.chapter} />
            ))}
            {}
          </div>
        ))}
      </Stack>
    </Box>
  );
}

function TextPreview({ sentence, chapter }) {
  return (
    <Tooltip
      title={sentence}
      componentsProps={{ tooltip: { sx: { fontSize: "16px" } } }}
    >
      <Box
        sx={{
          height: 20,
          overflow: "hidden",
          my: 2,
          whiteSpace: "nowrap",
          width: "100%",
          // maxWidth: 900,
          textOverflow: "ellipsis",
          minWidth: 0,
        }}
      >
        <b>{chapter}</b> {sentence}
      </Box>
    </Tooltip>
  );
}

export default App;
