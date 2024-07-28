import {
  AnimatedAxis,
  AnimatedLineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import { Box, Stack, Typography } from "@mui/material";
import { BookData, ChapterRow } from "./utils";
import { useDataContext } from "./DataContext";

const tickLabelOffset = 10;

const accessors = {
  xAccessor: (d) => d?.chapterFlat,
  yAccessor: (d) => d.value || 0,
};

type RowShape = {
  chapterFlat?: number;
  days?: number;
  value: number;
};

export function LineChartTM({
  data,
  xScale = { type: "point" },
  width = 700,
  height = 500,
}: {
  keyName: "chapterFlat" | "days";
  xScale?: { type: "point" | "linear" };
  width?: number;
  height?: number;
  data: {
    name: string;
    color: string;
    info: RowShape[];
  }[];
}) {
  const { books, chapters } = useDataContext();
  return (
    <div>
      <XYChart
        width={width}
        height={height}
        margin={{ left: 24, top: 35, bottom: 38, right: 27 }}
        xScale={xScale}
        yScale={{ type: "linear" }}
      >
        <AnimatedAxis
          hideAxisLine
          hideTicks
          orientation="bottom"
          tickLabelProps={() => ({ dy: tickLabelOffset })}
          left={30}
          numTicks={4}
        />
        <AnimatedAxis
          hideAxisLine
          hideTicks
          orientation="left"
          numTicks={4}
          tickLabelProps={() => ({ dx: 0 })}
        />

        {data.map((d) => (
          <AnimatedLineSeries
            stroke={d.color}
            dataKey={d.name}
            data={d.info}
            {...accessors}
          />
        ))}
        <Tooltip<RowShape>
          snapTooltipToDatumX
          snapTooltipToDatumY
          showSeriesGlyphs
          glyphStyle={{
            fill: "white",
            strokeWidth: 0,
          }}
          renderTooltip={({ tooltipData: { datumByKey, nearestDatum } }) => {
            const chapter = chapters[nearestDatum.datum.chapterFlat - 1];
            return (
              <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <div>B {chapter?.book}</div>
                    <div>{books[chapter?.book - 1]?.title}</div>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <div>Ch {chapter?.chapter}</div>
                    <div>
                      {String(chapter?.chapter) === chapter?.title
                        ? ""
                        : chapter?.title}
                    </div>
                  </Typography>
                </Box>
                {data.map((d) => {
                  const value = datumByKey[d.name].datum.value;
                  return (
                    <Stack spacing={1}>
                      <Stack spacing={1} direction="row">
                        <Box
                          sx={{ width: 12, height: 12, background: d.color }}
                        />
                        <Box sx={{ fontSize: 18 }}>{d.name}</Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <div>{value}</div>
                      </Stack>
                      <Box>{datumByKey[d.name].datum.comment}</Box>
                    </Stack>
                  );
                })}
              </Stack>
            );
          }}
        />
      </XYChart>
    </div>
  );
}
