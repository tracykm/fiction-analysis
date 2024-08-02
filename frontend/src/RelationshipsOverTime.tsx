import { Annotation, Connector } from "@visx/annotation";
import { scaleLinear } from "d3-scale";
import { useState } from "react";
import { LineChartTM, ToolChapterTitle, ToolCharacterRow } from "./LineChartTM";
import { SelectInput } from "./SelectInput";
import { Box, Button, Stack } from "@mui/material";
import { RelationshipModal } from "./RelationshipModal";
import { useDataContext } from "./DataContext";
import { Tooltip } from "@visx/xychart";

function getFeelingEmoji(value: number) {
  if (value > 5) return "💕";
  if (value > 2) return "😊";
  if (value < -5) return "😡";
  if (value < -2) return "😞";
  return "😐";
}

function RelationshipTimeChart({ onClick, data }) {
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

  return (
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
            <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
              <ToolChapterTitle chapterFlat={nearestDatum.datum.chapterFlat} />
              {data.map((line) => {
                const value = datumByKey[line.name].datum.value;
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
          );
        }}
      />
    </LineChartTM>
  );
}

export function RelationshipsOverTime() {
  const { relationships, relationshipTimelines, chapters } = useDataContext();

  const [open, setOpen] = useState(false);
  const pairs: Record<string, { from: string; to: string }[]> = {};
  Object.entries(relationshipTimelines).forEach(([fromName, to]) => {
    Object.keys(to).forEach((toName) => {
      const pairName = [fromName, toName].sort().join(" and ");
      pairs[pairName] = [
        { from: fromName, to: toName },
        { from: toName, to: fromName },
      ];
    });
  });
  const options = Object.entries(pairs).map(([label, value]) => ({
    label,
    id: label,
    value,
  }));
  const [selected, setSelected] = useState(options[0].id);
  const [selectedChapter, setSelectedChapter] = useState<number>();

  const selectedOption = options.find((d) => d.id === selected) || options[0];

  const chartData = selectedOption?.value.map(({ from, to }, i) => ({
    color: i === 0 ? "#25CED1" : "#FF8A5B",
    info: relationshipTimelines[from][to].positivity,
    name: `${from}'s Feelings`,
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
      {open && (
        <RelationshipModal
          onClose={() => setOpen(false)}
          title={selectedOption.label}
          relationship={
            relationships[selectedOption.value[0].from][
              selectedOption.value[0].to
            ]
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
        <Button sx={{ whiteSpace: "nowrap" }} onClick={() => setOpen(true)}>
          Their story
        </Button>
      </Stack>
      <RelationshipTimeChart
        onClick={({ datum, key }) => {
          setSelectedChapter(datum.chapterFlat);
          setSelected(key);
          setOpen(true);
        }}
        data={chartData}
      />
    </>
  );
}
