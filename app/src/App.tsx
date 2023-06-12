import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import characters from "./data/characters.json";
import { LineChart } from "./LineChart";
import { ButtonGroupInput } from "./ButtonGroup";
import { SelectInput } from "./SelectInput";

const getPercent = (char_count) =>
  Math.round(
    (char_count /
      characters.Lyra.char_count[characters.Lyra.char_count.length - 1]
        .char_count) *
      100
  );

function chunkDataByChapter(data: typeof characters.Lyra) {
  const simpleData = [...Array(100)].reduce(
    (acc, _, i) => ({ ...acc, [i]: 0 }),
    {}
  );

  data.char_count.forEach((d) => {
    const chapter = getPercent(d.char_count);
    simpleData[chapter] = simpleData[chapter] || 0;
    simpleData[chapter] += 1;
  });
  return Object.entries(simpleData).map(([date, value]) => ({
    date,
    value,
  }));
}

const categories = new Set(
  Object.values(characters).flatMap((d) => (d as any)?.category)
);

const categoryOptions = Array.from(categories).map((d) => ({
  label: d,
  id: d,
}));
const COLORS = ["#FFFFFF", "#25CED1", "#FF8A5B", "#EA526F", "#FCEADE"];

function App() {
  const [selected, setSelected] = useState(["Lyra"]);
  const [category, setCategory] = useState<string>();

  const data = selected.map((s, i) => ({
    color: COLORS[i] || "white",
    info: chunkDataByChapter(characters[s]),
  }));

  let options = Object.keys(characters)
    .map((label) => ({
      value: label,
      label: (
        <div>
          {label}{" "}
          <span style={{ opacity: 0.4 }}>{characters[label].count}</span>
        </div>
      ),
      count: characters[label].count,
      category: characters[label].category,
      tooltip: characters[label].category?.join(", "),
    }))
    .filter((d) => d.count > 2);
  options.sort((a, b) => b.count - a.count);

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
      {selected.join(", ")}{" "}
      <Button onClick={() => setSelected([])}>Clear</Button>
      <Stack spacing={2} direction={{ sm: "row" }}>
        <LineChart data={data} key={selected.length} />
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
      <Stack spacing={2} direction="row">
        {options.map(
          ({ value: c }) =>
            selected.includes(c) && (
              <div key={c}>
                <div>{c}</div>
                {characters[c].count}
                {characters[c].char_count.map((l, i) => (
                  <Tooltip key={i} title={l.sentence} placement="right">
                    <div>{l.chapter}</div>
                  </Tooltip>
                ))}
                {}
              </div>
            )
        )}
      </Stack>
    </Box>
  );
}

export default App;
