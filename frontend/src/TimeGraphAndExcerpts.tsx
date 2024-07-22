import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { COLORS, characters, processedCharacters } from "./utils";
import { uniq } from "lodash-es";

const characterOptions = Object.keys(characters).map((label, i) => ({
  value: label,
  label: (
    <div key={label || i}>
      {label} <span style={{ opacity: 0.4 }}>{characters[label].count}</span>
    </div>
  ),
  count: characters[label].count,
  category: characters[label].category,
  // tooltip: characters[label].category?.join(", "),
}));

characterOptions.sort((a, b) => b.count - a.count);

const categories = new Set(
  Object.values(characters).flatMap((d) => (d as any)?.category)
);

const categoryOptions = Array.from(categories).map((d) => ({
  label: d,
  id: d,
}));

export function TimeGraphAndExcerpts() {
  const [selected, setSelected] = useState(["Lee Scoresby"]);
  const [category, setCategory] = useState<string>();

  const data = selected.map((s, i) => ({
    color: COLORS[i] || "white",
    info: processedCharacters[s],
    name: s,
  }));

  return (
    <>
      <Stack spacing={2} direction={{ sm: "row" }}>
        <LineChartTM data={data} keyName="chapterFlat" />
        <SelectionSidebar
          {...{ selected, setSelected, category, setCategory }}
        />
      </Stack>
      <TextExcerpts selected={selected} />
    </>
  );
}

function SelectionSidebar({
  selected,
  setSelected,
  category,
  setCategory,
}: {
  selected: string[];
  setSelected: (arg: string[]) => void;
  category?: string;
  setCategory: (arg: string) => void;
}) {
  let options = characterOptions;

  if (category) {
    options = options.filter((d) => (d as any).category?.includes(category));
  }
  return (
    <Box sx={{ height: { xs: 150, sm: 500 }, overflow: "scroll" }}>
      <SelectInput
        options={[{ label: "All", id: "" }, ...categoryOptions]}
        selected={category}
        onChange={setCategory}
        label="Category"
      />
      {selected.length} Selected
      <Button onClick={() => setSelected([])}>X Clear</Button>
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
  );
}

function TextExcerpts({ selected }: { selected: string[] }) {
  return (
    <Stack
      sx={{ mt: 2, width: `${100 / selected.length}%` }}
      spacing={2}
      direction="row"
    >
      {selected.map((name, i) => (
        <div key={name || i} style={{ width: "100%" }}>
          <Box sx={{ color: COLORS[i], fontSize: 18 }}>{name}</Box>
          <Box sx={{ color: "#888" }}>
            {uniq(characters[name].category)?.join(", ")}
          </Box>
          {characters[name].count.toLocaleString()} References
          {characters[name].char_count.map((l, i) => (
            <ExcerptLine key={i} sentence={l.sentence} chapter={l.chapter} />
          ))}
          {}
        </div>
      ))}
    </Stack>
  );
}

function ExcerptLine({
  sentence,
  chapter,
}: {
  sentence: string;
  chapter: number;
}) {
  const [book, chapterDetail] = String(chapter).split(".");
  return (
    <Tooltip
      title={sentence}
      componentsProps={{
        tooltip: { sx: { fontSize: "16px", maxWidth: 500, lineHeight: 1.5 } },
      }}
    >
      <Box
        sx={{
          height: 20,
          overflow: "hidden",
          my: 2,
          whiteSpace: "nowrap",
          width: "100%",
          textOverflow: "ellipsis",
          minWidth: 0,
          color: "#888",
        }}
      >
        <b style={{ width: 70 }}>
          B{book} Ch{chapterDetail}
        </b>{" "}
        {sentence}
      </Box>
    </Tooltip>
  );
}
