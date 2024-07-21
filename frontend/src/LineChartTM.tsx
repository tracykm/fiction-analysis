import {
  AnimatedAxis,
  AnimatedLineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart";
import { Box, Stack } from "@mui/material";

const tickLabelOffset = 10;

const accessors = {
  xAccessor: (d) => d.chapterFlat,
  yAccessor: (d) => d.value,
};

type RowShape = {
  chapterFlat?: number;
  days?: number;
  value: number;
  chapter: number;
};

export function LineChartTM({
  data,
}: {
  keyName: "chapterFlat" | "days";
  data: {
    name: string;
    color: string;
    info: RowShape[];
  }[];
}) {
  return (
    <div>
      <XYChart
        width={700}
        height={500}
        margin={{ left: 24, top: 35, bottom: 38, right: 27 }}
        xScale={{ type: "linear" }}
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

        {data.map((d, i) => (
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
            fill: "#008561",
            strokeWidth: 0,
          }}
          renderTooltip={({ tooltipData: { datumByKey, nearestDatum } }) => {
            const [book, chapterDetail] = String(
              nearestDatum.datum.chapter
            ).split(".");
            return (
              <Stack spacing={2} sx={{ m: 1, mb: 2 }}>
                <Box>
                  Book {Number(book) || "-"}, Chapter{" "}
                  {Number(chapterDetail) || "-"}
                </Box>
                {data.map((d) => {
                  return (
                    <Stack spacing={1}>
                      <Stack spacing={1} direction="row">
                        <Box
                          sx={{ width: 12, height: 12, background: d.color }}
                        />
                        <Box sx={{ fontSize: 18 }}>{d.name}</Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <div>{datumByKey[d.name].datum.value}</div>
                      </Stack>
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
