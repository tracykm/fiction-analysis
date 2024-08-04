import { Annotation, Connector } from "@visx/annotation";
import { scaleLinear } from "d3-scale";
import { useState } from "react";
import { LineChartTM, ToolChapterTitle, ToolCharacterRow } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { Box, Button, Stack } from "@mui/material";
import { RelationshipModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";
import { Tooltip } from "@visx/xychart";
import { ErrorBoundary } from "./ErrorBoundry";
import { COLORS } from "./utils";

function getFeelingEmoji(value: number) {
  if (value > 5) return "💕";
  if (value > 2) return "😊";
  if (value < -5) return "😡";
  if (value < -2) return "😞";
  return "😐";
}

function RelationshipTimeChart({ onClick, data, setSelectedRelationship }) {
  const height = 300;
  const width = 900;
  const yScale = scaleLinear().domain([-11, 11]).range([height, 0]);
  const yPosition = yScale(0);
  const margin = {
    left: 55,
    top: 12,
    bottom: 36,
    right: 24,
  };
  const sameReversed =
    data.length === 2 &&
    data[0].from === data[1].to &&
    data[1].from === data[0].to;
  return (
    <>
      <LineChartTM
        yScale={yScale}
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
        xAxisProps={{ tickValues: undefined }}
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
            renderTooltip={({ tooltipData: { datumByKey, nearestDatum } }) => {
              return (
                <ErrorBoundary>
                  <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
                    <ToolChapterTitle
                      chapterFlat={nearestDatum.datum.chapterFlat}
                    />
                    {data.map((line) => {
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
      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
        {data.map((line) => (
          <Stack
            direction="row"
            spacing={1}
            key={line.name}
            sx={{ alignItems: "center" }}
          >
            <Box sx={{ width: 12, height: 12, background: line.color }} />
            <Box sx={{ fontSize: 18 }}>{line.name}</Box>
            {!sameReversed && (
              <Button
                sx={{ whiteSpace: "nowrap" }}
                onClick={() =>
                  setSelectedRelationship({ to: line.to, from: line.from })
                }
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

export function RelationshipsOverTime() {
  const { relationships, relationshipTimelines, chapters, manualConfig } =
    useDataContext();

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
      pairs[label] = relationships;
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

  const chartData = selectedOption?.value.map(({ from, to, name }, i) => ({
    color: COLORS[i] || "white",
    info: relationshipTimelines[from][to].positivity,
    name: name || `${from}'s Feelings`,
    to,
    from,
  }));

  if (chapters[0].chapterFlat !== chartData[0].info[0].chapterFlat) {
    chartData.map((d) => {
      d.info.unshift({
        chapterFlat: chapters[0].chapterFlat,
        value: d.info[0].value,
      });
    });
  }
  if (
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
          const line = selectedOption?.value.find((d) => d.name === key);
          setSelectedRelationship(line);
        }}
        data={chartData}
        setSelectedRelationship={setSelectedRelationship}
      />
    </>
  );
}
