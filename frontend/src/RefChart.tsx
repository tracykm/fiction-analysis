import { AnimatedAxis, Margin, XYChart } from "@visx/xychart";
import { Annotation, Connector } from "@visx/annotation";
import { Box, Stack, Typography } from "@mui/material";
import { useDataContext } from "./DataContext";
import { AnimatedAxisProps } from "@visx/xychart/lib/components/axis/AnimatedAxis";
import { Fragment, useRef } from "react";
import { withTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { useParentSize } from "@visx/responsive";
import { scaleLinear } from "d3";
import { COLORS } from "./utils";

import { AxisBottom, AxisLeft } from "@visx/axis";

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
      {books.length > 1 && (
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
      )}
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
  selected = false,
}: {
  name?: string;
  value: any;
  line;
  selected: boolean;
}) {
  return (
    <Stack spacing={1} direction="row" sx={{ opacity: selected ? 1 : 0.7 }}>
      <Box sx={{ width: 12, height: 12, background: line.color }} />
      <Box
        sx={{
          fontSize: 18,
          fontWeight: selected ? 600 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name || line.name}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ fontWeight: selected ? 600 : 400 }}>{value}</Box>
    </Stack>
  );
}

function trimText(text = "", threshold = 100) {
  if (text.length <= threshold) return text;
  return text.slice(0, threshold).concat("...");
}

export const RefChart = withTooltip(RefChartInner);

export function RefChartInner({
  data,
  yScale,
  width: _width = 700,
  margin,
  onClick,
  xAxisProps,
  yAxisProps,
  barHeight = 50,
  children,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  hideTooltip,
  showTooltip,
}: {
  keyName: "chapterFlat" | "days";
  yScale?: any;
  width?: number;
  barHeight?: number;
  data: {
    name: string;
    color: string;
    info: RowShape[];
  }[];
  margin: Margin;
  onClick: (d: { datum: RowShape; key: string; index: number }) => void;
  xAxisProps?: Partial<AnimatedAxisProps<any>>;
  yAxisProps?: Partial<AnimatedAxisProps<any>>;
  children?: React.ReactNode;
  tooltipOpen;
  tooltipLeft;
  tooltipTop;
  tooltipData;
  hideTooltip;
  showTooltip;
}) {
  const { chapters, selectedBook, fullCharacters } = useDataContext();
  const { parentRef, width } = useParentSize({ debounceTime: 150 });
  const height = barHeight * data.length + margin.top + margin.bottom;

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const xScale = scaleLinear()
    .domain([
      chapters[0].chapterFlat,
      chapters[chapters.length - 1].chapterFlat,
    ])
    .range([margin.left, width]);

  const tooltipTimeout = useRef<number | undefined>();

  const tickValues = chapters
    .filter((c, i) => {
      if (c.book === chapters[i - 1]?.book) return false;
      return true;
    })
    .map((c) => c.chapterFlat);
  const domain = xScale?.domain();
  const range = xScale?.range();
  const barWidth = (range[1] - range[0]) / (domain[1] - domain[0]);
  const maxValue = Math.max(
    ...data.map((d) => Math.max(...d.info.map((i) => i.value)))
  );

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    minHeight: 50,
    backgroundColor: "rgba(255,255,255,1)",
    color: "black",
  };

  return (
    <Box
      sx={{
        maxWidth: _width,
        "rect:hover": { fill: COLORS[0], opacity: 1 },
        rect: { cursor: "pointer" },
      }}
      ref={parentRef}
    >
      <svg width={width} height={height}>
        {/* <AxisBottom
              top={yMax}
              scale={temperatureScale}
              stroke={purple3}
              tickStroke={purple3}
              tickLabelProps={{
                fill: purple3,
                fontSize: 10,
                textAnchor: 'middle',
              }}
            /> */}
        <AxisBottom
          top={yMax}
          scale={xScale}
          hideAxisLine
          hideTicks
          orientation="bottom"
          // tickLabelProps={() => ({ dy: tickLabelOffset })}
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
          top={height - margin.top - margin.bottom + 6}
          {...xAxisProps}
        />
        {data.map((character, cIdx) => {
          return character.info.map((info, i) => {
            const y = cIdx * barHeight + margin.top;
            const x = xScale(info.chapterFlat);
            return (
              <Fragment key={info.chapterFlat + character.name}>
                <text
                  // textLength={margin.left}
                  y={y + barHeight / 2}
                  fill={character.color}
                  fontSize={14}
                  fontWeight={200}
                  textAnchor="end"
                  x={margin.left - 10}
                  onClick={() =>
                    onClick({ datum: info, key: character.name, index: i })
                  }
                >
                  {trimText(
                    fullCharacters[character.name]?.shortName || character.name,
                    14
                  )}
                </text>
                {info.value && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={character.color}
                    className={info.value ? "inactive" : ""}
                    opacity={
                      info.value === 0
                        ? 0
                        : Math.max(info.value / maxValue, 0.1)
                    }
                    onClick={() => {
                      onClick({ datum: info, key: character.name, index: i });
                    }}
                    onMouseLeave={() => {
                      tooltipTimeout.current = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={() => {
                      if (tooltipTimeout.current) {
                        clearTimeout(tooltipTimeout.current);
                      }
                      // debugger;
                      const top = y + margin.top;
                      const left = x + barWidth;
                      showTooltip({
                        tooltipData: {
                          x,
                          y,
                          character,
                          chapterFlat: info.chapterFlat,
                        },
                        tooltipTop: top,
                        tooltipLeft: left,
                      });
                    }}
                  />
                )}
              </Fragment>
            );
          });
        })}

        {tickValues.map((val) => {
          const x = xScale(val);
          return (
            <Annotation
              x={x}
              y={margin.top - 6}
              dx={0}
              dy={height - margin.bottom - margin.top + 12}
            >
              <Connector stroke="grey" pathProps={{ strokeDasharray: "4 4" }} />
            </Annotation>
          );
        })}
      </svg>
      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <Box sx={{ p: 1 }}>
            <ToolChapterTitle chapterFlat={tooltipData.chapterFlat} />
            <Box sx={{ m: 1 }} />
            <Stack spacing={1}>
              {data.map((d) => (
                <ToolCharacterRow
                  key={d.name}
                  line={d}
                  name={d.name}
                  value={
                    d.info?.find(
                      (i) => i.chapterFlat === tooltipData.chapterFlat
                    ).value
                  }
                  selected={d.name === tooltipData.character.name}
                />
              ))}
            </Stack>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}
