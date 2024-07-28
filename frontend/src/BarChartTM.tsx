import { Box } from "@mui/material";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import Bar from "@visx/shape/lib/shapes/Bar";

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

export const BarChartTM: React.FC<HorizontalBarProps> = ({
  height = 400,
  width = 900,
  data = data_temp,
  onClick,
}) => {
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

  return (
    <Box
      sx={{
        rect: { cursor: "pointer", opacity: 0.7 },
        "rect:hover": { opacity: 1 },
      }}
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
    </Box>
  );
};
