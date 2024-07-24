import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { Checkboxes } from "./Checkboxes";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import {
  BOOK_START_LETTER_INDEX,
  COLORS,
  ChapterRow,
  LETTERS_PER_PAGE,
  chaptersFullData,
} from "./utils";
import { uniq } from "lodash-es";
import { ErrorBoundary } from "./ErrorBoundry";

export function TimeGraphAndExcerpts({
  characters,
  chapters,
}: {
  characters: CharacterData;
  chapters: ChapterRow[];
}) {
  const [selected, setSelected] = useState(["Lee Scoresby"]);
  const [category, setCategory] = useState<string>();

  const data = selected.map((name, i) => ({
    color: COLORS[i] || "white",
    info: chapters.map((d) => ({
      chapterFlat: d.chapterFlat,
      value: characters[name]?.refs[d.chapterFlat]?.length || 0,
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
          {...{
            selected,
            setSelected,
            category,
            setCategory,
            characters,
            chapters,
          }}
        />
      </Stack>
      <ErrorBoundary>
        <TextExcerpts
          selected={selected}
          characters={characters}
          chapters={chapters}
        />
      </ErrorBoundary>
    </>
  );
}

function SelectionSidebar({
  selected,
  setSelected,
  category,
  setCategory,
  characters,
}: {
  selected: string[];
  setSelected: (arg: string[]) => void;
  category?: string;
  setCategory: (arg: string) => void;
  characters: CharacterData;
}) {
  const categories = new Set(
    Object.values(characters).flatMap((d) => (d as any)?.category)
  );

  const categoryOptions = Array.from(categories).map((d) => ({
    label: d,
    id: d,
  }));

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

function TextExcerpts({
  selected,
  characters,
}: {
  selected: string[];
  characters: CharacterData;
}) {
  const character = characters[name];
  return (
    <Stack
      sx={{ mt: 2, width: `${100 / selected.length}%` }}
      spacing={2}
      direction="row"
    >
      {selected.map((name, i) => {
        const character = characters[name];
        if (!character) {
          return (
            <div key={name || i} style={{ width: "100%" }}>
              <Stack sx={{ mb: 2, width: 400 }}>
                <Box sx={{ color: COLORS[i], fontSize: 18 }}>{name}</Box>
                <Box sx={{ color: "#888" }}>0 References</Box>
              </Stack>
            </div>
          );
        }
        return (
          <div key={name || i} style={{ width: "100%" }}>
            <Stack sx={{ mb: 2 }}>
              <Box sx={{ color: COLORS[i], fontSize: 18 }}>{name}</Box>
              <Box sx={{ color: "#888" }}>
                {uniq(character.category)?.join(", ")}
              </Box>
              <Box sx={{ color: "#888" }}>
                {character.count.toLocaleString()} References
              </Box>
            </Stack>
            {Object.entries(character.refs).map(([chapterFlat, refs], i) => (
              <ChapterExcerpt chapterFlat={chapterFlat} refs={refs} />
            ))}
          </div>
        );
      })}
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
  const chapter = chaptersFullData[Number(chapterFlat) - 1];
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
  chapter: ChapterRow;
}) {
  const page = Math.floor(
    (letterIndex - BOOK_START_LETTER_INDEX[chapter?.book]) / LETTERS_PER_PAGE
  );
  return (
    <Tooltip
      title={sentence}
      componentsProps={{
        tooltip: { sx: { fontSize: "16px", maxWidth: 500, lineHeight: 1.5 } },
      }}
      placement="top"
      disableInteractive
    >
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
    </Tooltip>
  );
}
