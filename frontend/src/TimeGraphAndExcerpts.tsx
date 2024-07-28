import { Box, Button, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { Checkboxes } from "./Checkboxes";
import { LineChartTM } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { COLORS, CharactersData, FullContextProps } from "./utils";
import { uniq } from "lodash-es";
import { ErrorBoundary } from "./ErrorBoundry";
import { RefsModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";

export function TimeGraphAndExcerpts() {
  const {
    characters,
    chapters,
    books,
    indexedSentences,
    manualConfig: { defaultSelectedCharacter, sharedCharacters },
  } = useDataContext();
  const [selected, setSelected] = useState([defaultSelectedCharacter]);
  const [category, setCategory] = useState<string>();
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
        />
      )}
      <Stack spacing={2} direction={{ sm: "row" }}>
        <ErrorBoundary>
          <LineChartTM
            data={data}
            keyName="chapterFlat"
            {...{ chapters, books }}
          />
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
      <TextExcerpts
        {...{ selected, characters, indexedSentences, setOpenedCharacter }}
      />
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
  characters: CharactersData;
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
