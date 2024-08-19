import {
  AnimatedAxis,
  AnimatedLineSeries,
  Margin,
  XYChart,
} from "@visx/xychart";
import { Box, Stack, Typography } from "@mui/material";
import { useDataContext } from "./DataContext";
import { AnimatedAxisProps } from "@visx/xychart/lib/components/axis/AnimatedAxis";

const tickLabelOffset = 10;

type RowShape = {
  chapterFlat?: number;
  days?: number;
  value: number;
};

export function ToolChapterTitle({ chapterFlat }: { chapterFlat: number }) {
  const { chapters, books } = useDataContext();
  const chapter = chapters.find((c) => c.chapterFlat === chapterFlat);
  return (
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
          {String(chapter?.chapter) === chapter?.title ? "" : chapter?.title}
        </div>
      </Typography>
    </Box>
  );
}

export function ToolCharacterRow({
  name,
  value,
  line,
}: {
  name?: string;
  value: any;
  line;
}) {
  return (
    <Stack spacing={1} direction="row">
      <Box sx={{ width: 12, height: 12, background: line.color }} />
      <Box sx={{ fontSize: 18 }}>{name || line.name}</Box>
      <Box sx={{ flexGrow: 1 }} />
      <div>{value}</div>
    </Stack>
  );
}

export function LineChartTM({
  data,
  xScale,
  yScale,
  width = 700,
  height = 500,
  margin,
  onClick,
  xAxisProps,
  yAxisProps,
  children,
}: {
  keyName: "chapterFlat" | "days";
  xScale?: any;
  yScale?: any;
  width?: number;
  height?: number;
  data: {
    name: string;
    color: string;
    info: RowShape[];
  }[];
  margin?: Partial<Margin>;
  onClick: (d: { datum: RowShape; key: string; index: number }) => void;
  xAxisProps?: Partial<AnimatedAxisProps<any>>;
  yAxisProps?: Partial<AnimatedAxisProps<any>>;
  children?: React.ReactNode;
}) {
  const { chapters, selectedBook } = useDataContext();
  const yAccessor = (d) => d.value || 0;

  const tickValues = chapters
    .filter((c, i) => {
      if (c.book === chapters[i - 1]?.book) return false;
      return true;
    })
    .map((c) => c.chapterFlat);

  return (
    <div style={{}}>
      <XYChart
        width={width}
        height={height}
        margin={{ left: 24, top: 35, bottom: 38, right: 24, ...margin }}
        xScale={
          xScale
            ? {
                type: "linear",
                domain: xScale.domain(),
                range: xScale.range(),
                zero: false,
              }
            : { type: "linear" }
        }
        yScale={
          yScale
            ? {
                type: "linear",
                domain: yScale.domain(),
                range: yScale.range(),
              }
            : { type: "linear" }
        }
        onPointerDown={onClick}
      >
        <AnimatedAxis
          hideAxisLine
          hideTicks
          orientation="bottom"
          tickLabelProps={() => ({ dy: tickLabelOffset })}
          numTicks={8}
          tickValues={selectedBook ? undefined : tickValues}
          tickFormat={(chapterFlat) => {
            if (!chapterFlat) return "";
            const chapter = chapters.find((c) => c.chapterFlat === chapterFlat);
            if (selectedBook) return `Ch ${chapter?.chapter}`;
            return `B ${chapter?.book}`;
          }}
          tickLabelProps={{
            fill: "white",
            fontSize: 10,
            textAnchor: "middle",
            opacity: 0.5,
          }}
          {...xAxisProps}
        />
        <AnimatedAxis
          hideAxisLine
          hideTicks
          orientation="left"
          numTicks={4}
          tickLabelProps={() => ({ dx: 0 })}
          tickLabelProps={{
            fill: "white",
            fontSize: 10,
            opacity: 0.5,
          }}
          {...yAxisProps}
        />

        {data.map((d) => (
          <AnimatedLineSeries
            stroke={d.color}
            dataKey={d.name}
            data={d.info}
            xAccessor={(d) => d?.chapterFlat}
            yAccessor={yAccessor}
          />
        ))}
        {children}
      </XYChart>
    </div>
  );
}
