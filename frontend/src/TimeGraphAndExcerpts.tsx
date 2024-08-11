import { Box, Button, TextField, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { Checkboxes } from "./Checkboxes";
import { LineChartTM, ToolChapterTitle, ToolCharacterRow } from "./LineChartTM";
import { COLORS, FullContextProps } from "./utils";
import { uniq } from "lodash-es";
import { ErrorBoundary } from "./ErrorBoundry";
import { RefsModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";
import { Tooltip as VixTooltip } from "@visx/xychart";
import { Annotation, Connector } from "@visx/annotation";
import { scaleLinear } from "d3-scale";

function RefCountByCharacterChart({
  onClick,
  data,
}: {
  onClick: any;
  data: {
    color: string;
    info: {
      chapterFlat: number;
      value: number;
    }[];
    name: string;
  }[];
}) {
  const { chapters } = useDataContext();
  const width = 600;
  const margin = { left: 34, top: 12, bottom: 36, right: 24 };
  const xScale = scaleLinear()
    .domain([
      chapters[0].chapterFlat,
      chapters[chapters.length - 1].chapterFlat,
    ])
    .range([0, width - (margin.left + margin.right)]);
  // const xPosition = yScale(0);
  const tickValues = chapters
    .filter((c, i) => {
      if (c.book === chapters[i - 1]?.book) return false;
      return true;
    })
    .map((c) => c.chapterFlat);

  return (
    <LineChartTM
      data={data}
      keyName="chapterFlat"
      width={width}
      onClick={onClick}
      margin={margin}
      // xScale={xScale}
    >
      <VixTooltip<any>
        snapTooltipToDatumX
        snapTooltipToDatumY
        showSeriesGlyphs
        glyphStyle={{
          fill: "white",
          strokeWidth: 0,
        }}
        renderTooltip={({ tooltipData: { datumByKey, nearestDatum } }) => {
          return (
            <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
              <ToolChapterTitle chapterFlat={nearestDatum.datum.chapterFlat} />
              {data.map((line) => {
                const value = datumByKey[line.name].datum.value;
                return (
                  <ToolCharacterRow key={line.name} line={line} value={value} />
                );
              })}
            </Stack>
          );
        }}
      />
      {tickValues.map((val) => {
        const x = xScale(val) + margin.left;
        return (
          <Annotation x={x} y={0} dx={0} dy={470}>
            <Connector stroke="grey" pathProps={{ strokeDasharray: "4 4" }} />
          </Annotation>
        );
      })}
    </LineChartTM>
  );
}

export function TimeGraphAndExcerpts() {
  const {
    characters,
    chapters,
    indexedSentences,
    manualConfig: { defaultSelectedCharacter, sharedCharacters },
  } = useDataContext();
  const [selected, setSelected] = useState([defaultSelectedCharacter]);
  const [selectedChapter, setSelectedChapter] = useState<number>();
  const [openedCharacter, setOpenedCharacter] = useState<string>();

  useEffect(() => {
    const availableSelected = selected.filter((d) => characters[d]);
    if (sharedCharacters) return;

    setSelected(
      availableSelected.length
        ? availableSelected
        : [Object.keys(characters)[0]]
    );
  }, [characters]);

  const data = selected.map((name, i) => ({
    color: COLORS[i] || "white",
    info: chapters.map((d) => ({
      chapterFlat: d.chapterFlat,
      value:
        characters[name]?.refs.filter(
          (r) => indexedSentences[r].chapterFlat === d.chapterFlat
        ).length || 0,
    })),
    name,
  }));

  return (
    <>
      {openedCharacter && (
        <RefsModal
          title={openedCharacter}
          refs={characters[openedCharacter].refs}
          onClose={() => setOpenedCharacter(undefined)}
          selectedChapter={selectedChapter}
        />
      )}
      <Stack spacing={2} direction={{ sm: "row" }}>
        <ErrorBoundary>
          <RefCountByCharacterChart
            data={data}
            onClick={(d) => {
              setSelectedChapter(d.datum.chapterFlat);
              setOpenedCharacter(d.key);
            }}
          />
        </ErrorBoundary>
        <SelectionSidebar
          {...{
            selected,
            setSelected,
            characters,
            chapters,
          }}
        />
      </Stack>
      <TextExcerpts
        {...{ selected, characters, indexedSentences, setOpenedCharacter }}
      />
    </>
  );
}

function SelectionSidebar({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (arg: string[]) => void;
}) {
  const { characters, manualConfig, books, selectedBook } = useDataContext();
  const [search, setSearch] = useState("");
  const showBook = !selectedBook && !manualConfig.sharedCharacters;
  const characterOptions = Object.keys(characters).map((label, i) => ({
    value: label,
    label: (
      <Box
        key={label || i}
        sx={{
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          maxWidth: 220,
          color: "#888",
        }}
      >
        <span style={{ color: "white" }}>{label} </span>
        <Tooltip
          title={
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              <div>{characters[label].count} References</div>
              <div style={{ opacity: 0.5 }}>
                {characters[label].category.join(", ")}
              </div>
              {characters[label]?.books &&
                characters[label]?.books.length !== books.length &&
                (showBook ? (
                  <div>
                    Book: {books[characters[label]?.books[0] - 1]?.title}
                  </div>
                ) : (
                  characters[label]?.books.map((b) => (
                    <div>
                      Book {b + 1}: {books[b - 1].title}
                    </div>
                  ))
                ))}
            </div>
          }
        >
          <span>
            {characters[label].count}{" "}
            {showBook
              ? `(${books[characters[label]?.books![0] - 1]?.title})`
              : ""}
          </span>
        </Tooltip>
      </Box>
    ),
    count: characters[label].count,
    category: characters[label].category,
  }));

  characterOptions.sort((a, b) => b.count - a.count);

  let options = characterOptions;
  if (search) {
    options = options.filter(
      (d) =>
        d.value.toLowerCase().includes(search) ||
        d.category.some((c) => c.toLowerCase().startsWith(search))
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        placeholder="Search by name or category"
        onChange={(e) => {
          const val = e.target.value;
          setSearch(val.toLowerCase());
        }}
        fullWidth
      />
      <div>
        {selected.length} Selected
        <Button onClick={() => setSelected([])}>X Clear</Button>
      </div>
      <Box
        sx={{
          height: { xs: 150, sm: 400 },
          overflowY: "scroll",
          width: "100%",
        }}
      >
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
    </Box>
  );
}

function TextExcerpts({
  selected,
  characters,
  indexedSentences,
  setOpenedCharacter,
}: {
  selected: string[];
  setOpenedCharacter: (arg: string) => void;
} & Pick<FullContextProps, "indexedSentences" | "characters">) {
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
        const cutoff = 3;
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
            {character.refs.slice(0, cutoff).map((ref, i) => (
              <ExcerptLine sentence={indexedSentences[ref].sentence} />
            ))}
            <Button
              onClick={() => {
                setOpenedCharacter(name);
              }}
            >
              See{" "}
              {character.refs.length > cutoff
                ? character.refs.length - cutoff
                : ""}{" "}
              more
            </Button>
          </div>
        );
      })}
    </Stack>
  );
}

function ExcerptLine({ sentence }: { sentence: string }) {
  return (
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
      {sentence}
    </Box>
  );
}
