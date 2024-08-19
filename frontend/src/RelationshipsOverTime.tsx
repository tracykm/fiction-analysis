import { Annotation, Connector } from "@visx/annotation";
import { scaleLinear } from "d3-scale";
import { useEffect, useState } from "react";
import { LineChartTM, ToolChapterTitle, ToolCharacterRow } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { Box, Button, Stack } from "@mui/material";
import { RelationshipModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";
import { Tooltip } from "@visx/xychart";
import { ErrorBoundary } from "./ErrorBoundry";
import { COLORS } from "./utils";
import { useParentSize } from "@visx/responsive";

function getFeelingEmoji(value: number) {
  if (value > 5) return "💕";
  if (value > 2) return "😊";
  if (value < -5) return "😡";
  if (value < -2) return "😞";
  return "😐";
}

function RelationshipTimeChart({ onClick, data, setSelectedRelationship }) {
  const { chapters, selectedBook } = useDataContext();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const yScale = scaleLinear().domain([-11, 11]).range([height, 0]);
  const margin = {
    left: 55,
    top: 12,
    bottom: 36,
    right: 0,
  };
  const xScale = scaleLinear()
    .domain([
      chapters[0].chapterFlat,
      chapters[chapters.length - 1].chapterFlat,
    ])
    .range([margin.left, width]);
  const yPosition = yScale(0);
  const sameReversed =
    data.length === 2 &&
    data[0].from === data[1].to &&
    data[1].from === data[0].to;

  const tickValues = chapters
    .filter((c, i) => {
      if (c.book === chapters[i - 1]?.book) return false;
      return true;
    })
    .map((c) => c.chapterFlat);
  return (
    <>
      <Box
        ref={parentRef}
        style={{ maxWidth: 900, height: 300 }}
        sx={{ svg: { cursor: "pointer" } }}
      >
        <LineChartTM
          yScale={yScale}
          xScale={xScale}
          data={data}
          keyName="chapterFlat"
          width={width}
          height={height}
          margin={margin}
          yAxisProps={{
            tickFormat: (d) => {
              if (typeof d !== "number") return "";
              if (d === 0) return "Neutral";
              if (d > 0) return "Love";
              return "Hate";
            },
            tickValues: [-10, 0, 10],
            left: margin.left - 10,
          }}
          xAxisProps={{
            tickValues: selectedBook ? undefined : tickValues,
            top: height - margin.top - margin.bottom + 22,
          }}
          onClick={onClick}
        >
          <Annotation
            x={margin.left}
            y={yPosition}
            dx={margin.left + width - margin.right}
            dy={0}
          >
            <Connector stroke="grey" pathProps={{ strokeDasharray: "4 4" }} />
          </Annotation>
          <ErrorBoundary>
            <Tooltip<any>
              snapTooltipToDatumX
              snapTooltipToDatumY
              showSeriesGlyphs
              glyphStyle={{
                fill: "white",
                strokeWidth: 0,
              }}
              renderTooltip={({
                tooltipData: { datumByKey, nearestDatum },
              }) => {
                const linesToShow = data.filter(
                  (d) =>
                    nearestDatum.datum.chapterFlat > d.info[0].chapterFlat &&
                    nearestDatum.datum.chapterFlat <
                      d.info[d.info.length - 1].chapterFlat
                );
                return (
                  <ErrorBoundary>
                    <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
                      <ToolChapterTitle
                        chapterFlat={nearestDatum.datum.chapterFlat}
                      />
                      {linesToShow.map((line) => {
                        const value = datumByKey[line.name]?.datum.value;
                        if (!value) return null;
                        return (
                          <Stack spacing={1}>
                            <ToolCharacterRow
                              key={line.name}
                              line={line}
                              name={`${line.name} ${getFeelingEmoji(value)}`}
                              value={` ${value}/10`}
                            />
                            <Box>{datumByKey[line.name].datum.comment}</Box>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </ErrorBoundary>
                );
              }}
            />
          </ErrorBoundary>
        </LineChartTM>
      </Box>
      <Stack direction="row" sx={{ mt: 2, flexWrap: "wrap" }}>
        {data.map((line) => (
          <Stack
            direction="row"
            spacing={1}
            key={line.name}
            sx={{ alignItems: "center", mr: 3 }}
          >
            <Box sx={{ width: 12, height: 12, background: line.color }} />
            <Box
              sx={{
                fontSize: 18,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {line.name}
            </Box>
            {!sameReversed && (
              <Button
                sx={{ whiteSpace: "nowrap" }}
                onClick={() => {
                  setSelectedRelationship({ to: line.to, from: line.from });
                }}
              >
                Their story
              </Button>
            )}
          </Stack>
        ))}
        <div style={{ flexGrow: 1 }} />
        {sameReversed && (
          <Button
            onClick={() =>
              setSelectedRelationship({
                to: data[0].to,
                from: data[0].from,
              })
            }
          >
            Their story
          </Button>
        )}
      </Stack>
    </>
  );
}

const FROM_FEELINGS = "s Feelings";

export function RelationshipsOverTime() {
  const {
    relationships,
    relationshipTimelines,
    chapters,
    manualConfig,
    characters,
  } = useDataContext();

  const [selectedRelationship, setSelectedRelationship] = useState<{
    to: string;
    from: string;
  }>();
  const pairs: Record<string, { from: string; to: string; name?: string }[]> =
    {};
  Object.entries(relationshipTimelines).forEach(([fromName, to]) => {
    Object.keys(to).forEach((toName) => {
      const pairName = [fromName, toName].sort().join(" and ");
      pairs[pairName] = [
        { from: fromName, to: toName },
        { from: toName, to: fromName },
      ];
    });
  });

  manualConfig.relationships?.timelineOptions?.forEach(
    ({ label, relationships }) => {
      const filteredRels = relationships.filter(
        (r) => characters[r.from] && characters[r.to]
      );
      if (filteredRels.length === 0) return;
      pairs[label] = filteredRels;
    }
  );

  const options = Object.entries(pairs).map(([label, value]) => ({
    label,
    id: label,
    value,
  }));
  const [selected, setSelected] = useState(options[0].id);
  const [selectedChapter, setSelectedChapter] = useState<number>();

  const selectedOption = options.find((d) => d.id === selected) || options[0];
  useEffect(() => {
    if (selectedOption?.id === selected) return;
    setSelected(selectedOption?.id);
  }, [selectedOption?.id]);

  const chartData = selectedOption?.value.map(({ from, to, name }, i) => ({
    color: COLORS[i + 1] || "white",
    info: relationshipTimelines[from][to].positivity,
    name: name || `${from}${FROM_FEELINGS}`,
    to,
    from,
  }));

  if (
    manualConfig.sharedCharacters &&
    chapters[0].chapterFlat !== chartData[0].info[0].chapterFlat
  ) {
    chartData.map((d) => {
      d.info.unshift({
        chapterFlat: chapters[0].chapterFlat,
        value: d.info[0].value,
      });
    });
  }
  if (
    manualConfig.sharedCharacters &&
    chapters[chapters.length - 1].chapterFlat !==
      chartData[0].info[chartData[0].info.length - 1].chapterFlat
  ) {
    chartData.map((d) => {
      d.info.push({
        chapterFlat: chapters[chapters.length - 1].chapterFlat,
        value: d.info[d.info.length - 1].value,
      });
    });
  }

  return (
    <>
      {selectedRelationship && (
        <RelationshipModal
          onClose={() => setSelectedRelationship(undefined)}
          title={`${selectedRelationship.from} and ${selectedRelationship.to}`}
          relationship={
            relationships[selectedRelationship.from][selectedRelationship.to]
          }
          selectedChapter={selectedChapter}
        />
      )}
      <Stack direction="row" spacing={2}>
        <SelectInput
          options={options}
          selected={selected}
          onChange={setSelected}
          label="Relationship"
        />
      </Stack>
      <RelationshipTimeChart
        onClick={({ datum, key }) => {
          setSelectedChapter(datum.chapterFlat);
          const line =
            selectedOption?.value.find((d) => d.name === key) ||
            selectedOption?.value.find(
              (d) => d.from === key.replace(FROM_FEELINGS, "")
            );
          setSelectedRelationship({
            to: line?.to || selectedOption.value[0].to,
            from: line?.from || selectedOption.value[0].from,
          });
        }}
        data={chartData}
        setSelectedRelationship={setSelectedRelationship}
      />
    </>
  );
}
