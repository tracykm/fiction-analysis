import { Box, Stack } from "@mui/material";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import Bar from "@visx/shape/lib/shapes/Bar";
import { useParentSize } from "@visx/responsive";
import { COLORS } from "./utils";
import { withTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { useRef } from "react";
import { useDataContext } from "./DataContext";

export interface HorizontalBarProps {
  height?: number;
  width?: number;
  data: BarData[];
  onClick?: (d: BarData) => void;
}

export type BarData = {
  label: string;
  amount: number;
  id: string;
  color?: string;
};
const data_temp = [
  { label: "Bitcoin", amount: 2 },
  { label: "Dodge", amount: 12 },
  { label: "Solana", amount: 9 },
];

const BarChartTMInner: React.FC<HorizontalBarProps> = ({
  height: _height = 400,
  width: _width = 900,
  data = data_temp,
  onClick,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  hideTooltip,
  showTooltip,
  margin = { left: 0, top: 0, bottom: 0, right: 0 },
}) => {
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const { characters } = useDataContext();
  // bounds
  const xMax = width - 220;
  const yMax = height - 10;

  // accessors
  const getCoinName = (d: HorizontalBarData) => d.label;
  const getCoinCount = (d: HorizontalBarData) => Number(d.amount);

  interface HorizontalBarData {
    label: string;
    amount: number;
  }

  const yScale = scaleBand<string>({
    range: [0, yMax],
    round: true,
    domain: data.map(getCoinName),
    padding: 0.4,
  });

  const xScale = scaleLinear<number>({
    range: [0, xMax],
    round: true,
    domain: [0, Math.max(...data.map(getCoinCount))],
  });

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    minHeight: 50,
    backgroundColor: "rgba(255,255,255,1)",
    color: "black",
  };
  const tooltipTimeout = useRef<number | undefined>();

  return (
    <Box
      sx={{
        rect: { cursor: "pointer" },
        "rect:hover": { fill: COLORS[0] },
        maxWidth: _width,
        height: _height,
      }}
      ref={parentRef}
    >
      <svg width={width} height={height}>
        <Group top={20}>
          {data.map((d) => {
            const label = getCoinName(d);
            const barWidth = yScale.bandwidth();
            const barHeight = xScale(getCoinCount(d));
            const barY = yScale(label);
            return (
              <>
                <Bar
                  key={`bar-${label}`}
                  x={0}
                  y={barY}
                  width={barHeight}
                  height={barWidth}
                  fill={d.color}
                  cursor="pointer"
                  onClick={(e) => {
                    onClick(d);
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
                    const top = barY + margin.top;
                    const left = barHeight + margin.left;
                    showTooltip({
                      tooltipData: {
                        x: barWidth,
                        y: barY,
                        label,
                        value: d.amount,
                        line: d,
                        // character,
                        // chapterFlat: info.chapterFlat,
                      },
                      tooltipTop: top,
                      tooltipLeft: left,
                    });
                  }}
                />
                <text
                  x={barHeight + 10}
                  y={barY + barWidth / 2}
                  dx={10}
                  dy=".33em"
                  fontSize={14}
                  textAnchor="start"
                  fill="white"
                  style={{ cursor: "pointer" }}
                >
                  {d.label}
                </text>
              </>
            );
          })}
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <Stack sx={{ p: 1 }} spacing={1}>
            <div style={{ fontWeight: 600 }}>
              {tooltipData.line.names
                .map((name) => characters[name].name)
                .join(" & ")}
            </div>
            <div>{tooltipData.value} Co-occurrences</div>
          </Stack>
        </Tooltip>
      )}
    </Box>
  );
};
export const BarChartTM = withTooltip(BarChartTMInner);
