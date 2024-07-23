import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import {
  BOOK_START_LETTER_INDEX,
  COLORS,
  LETTERS_PER_PAGE,
  chapters,
  characters,
} from "./utils";
import { uniq } from "lodash-es";
import { ErrorBoundary } from "./ErrorBoundry";

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

  const data = selected.map((name, i) => ({
    color: COLORS[i] || "white",
    info: chapters.map((d) => ({
      chapterFlat: d.chapterFlat,
      value: characters[name].refs[d.chapterFlat]?.length || 0,
    })),
    name,
  }));

  return (
    <>
      <Stack spacing={2} direction={{ sm: "row" }}>
        <ErrorBoundary>
          <LineChartTM data={data} keyName="chapterFlat" />
        </ErrorBoundary>
        <SelectionSidebar
          {...{ selected, setSelected, category, setCategory }}
        />
      </Stack>
      <ErrorBoundary>
        <TextExcerpts selected={selected} />
      </ErrorBoundary>
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
          <Stack sx={{ mb: 2 }}>
            <Box sx={{ color: COLORS[i], fontSize: 18 }}>{name}</Box>
            <Box sx={{ color: "#888" }}>
              {uniq(characters[name].category)?.join(", ")}
            </Box>
            <Box sx={{ color: "#888" }}>
              {characters[name].count.toLocaleString()} References
            </Box>
          </Stack>
          {Object.entries(characters[name].refs).map(
            ([chapterFlat, refs], i) => (
              <ChapterExcerpt chapterFlat={chapterFlat} refs={refs} />
            )
          )}
          {}
        </div>
      ))}
    </Stack>
  );
}

function ChapterExcerpt({
  chapterFlat,
  refs,
}: {
  chapterFlat: string;
  refs: { sentence: string; letterIndex: number }[];
}) {
  const chapter = chapters[Number(chapterFlat) - 1];
  const [showMore, setShowMore] = useState(false);

  const cutoffNum = 3;

  const baseRefs = refs.slice(0, cutoffNum);
  const moreRefs = refs.slice(cutoffNum, -1);

  return (
    <Box key={chapterFlat} sx={{ my: 2 }}>
      <Box>
        B{chapter?.book}, Ch{chapter?.chapter}
      </Box>
      {baseRefs.map((l) => (
        <ExcerptLine chapter={chapter} {...l} />
      ))}
      {moreRefs.length && !showMore ? (
        <Button onClick={() => setShowMore(!showMore)} sx={{ my: -1 }}>
          + {moreRefs.length} More
        </Button>
      ) : null}
      {showMore &&
        moreRefs.map((l) => <ExcerptLine chapter={chapter} {...l} />)}
    </Box>
  );
}

function ExcerptLine({
  sentence,
  letterIndex,
  chapter,
}: {
  sentence: string;
  letterIndex: number;
  chapter;
}) {
  const page = Math.floor(
    (letterIndex - BOOK_START_LETTER_INDEX[chapter.book]) / LETTERS_PER_PAGE
  );
  return (
    <Tooltip
      title={sentence}
      componentsProps={{
        tooltip: { sx: { fontSize: "16px", maxWidth: 500, lineHeight: 1.5 } },
      }}
      placement="top"
    >
      <>
        <Box
          sx={{
            height: 20,
            overflow: "hidden",
            my: 0.5,
            whiteSpace: "nowrap",
            width: "100%",
            textOverflow: "ellipsis",
            minWidth: 0,
            color: "#888",
          }}
        >
          <span>p.{page}</span> {sentence}
        </Box>
      </>
    </Tooltip>
  );
}
