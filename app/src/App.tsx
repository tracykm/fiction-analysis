import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import characters from "./data/characters.json";
import { LineChart } from "./LineChart";

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

const COLORS = ["#FFFFFF", "#25CED1", "#FF8A5B", "#EA526F", "#FCEADE"];

function App() {
  const [selected, setSelected] = useState(["Lyra"]);

  const data = selected.map((s, i) => ({
    color: COLORS[i] || "white",
    info: chunkDataByChapter(characters[s]),
  }));

  const options = Object.keys(characters)
    .map((label) => ({
      value: label,
      label: (
        <div>
          {label}{" "}
          <span style={{ opacity: 0.4 }}>{characters[label].count}</span>
        </div>
      ),
      count: characters[label].count,
    }))
    .filter((d) => d.count > 2);
  options.sort((a, b) => b.count - a.count);

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", p: 4 }}>
      <header>
        <h1>His Dark Materials</h1>
      </header>
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
