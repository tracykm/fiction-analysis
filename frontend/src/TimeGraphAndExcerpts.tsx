import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import { ToolChapterTitle, ToolCharacterRow } from "./LineChartTM";
import { COLORS } from "./utils";
import { ErrorBoundary } from "./ErrorBoundry";
import { RefsModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";
import { Tooltip as VixTooltip } from "@visx/xychart";
import { RefChart } from "./RefChart";
import { CharacterSearch } from "./CharacterSearch";
import { sortBy } from "lodash-es";

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
  const width = 900;
  const margin = { left: 130, top: 12, bottom: 36, right: 0 };

  return (
    <RefChart
      data={data}
      keyName="chapterFlat"
      width={width}
      onClick={onClick}
      margin={margin}
      height={700}
    ></RefChart>
  );
}

export function TimeGraphAndExcerpts() {
  const {
    characters,
    chapters,
    indexedSentences,
    manualConfig: { sharedCharacters },
  } = useDataContext();
  const defaultSelectedCharacters = sortBy(
    Object.values(characters),
    (d) => d.count * -1
  )
    .map((d) => d.name)
    .slice(0, 10);

  const [selected, setSelected] = useState(defaultSelectedCharacters);
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
    color: i % 2 ? COLORS[1] : COLORS[2],
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
          refs={characters[openedCharacter]?.refs}
          onClose={() => setOpenedCharacter(undefined)}
          selectedChapter={selectedChapter}
        />
      )}
      <CharacterSearch
        onChange={(e, opts) => {
          setSelected(opts);
        }}
        value={selected}
        multiple
      />
      <ErrorBoundary>
        <RefCountByCharacterChart
          data={data}
          onClick={(d) => {
            setSelectedChapter(d.datum.chapterFlat);
            if (!characters[d.key]) return;
            setOpenedCharacter(d.key);
          }}
        />
      </ErrorBoundary>
    </>
  );
}
