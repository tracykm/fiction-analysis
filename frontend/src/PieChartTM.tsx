import { useState, useMemo, useRef } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { Box, Stack, SxProps } from "@mui/material";
import { sortBy, sumBy } from "lodash-es";
import { withTooltip, Tooltip, defaultStyles } from "@visx/tooltip";

export type PieData = {
  label: string;
  amount: number;
  id: string;
  color?: string;
  detail: any[];
};

function ActiveDetail({
  active,
  width,
  includeDetailPercent,
  activeDirection,
}: {
  active: PieData;
  width: number;
  includeDetailPercent?: boolean;
  activeDirection?: "right" | "left";
}) {
  const cutoffAt = 12;
  const count = active.detail.length;

  let details = sortBy(active.detail, (d) => d.count * -1);
  details = details.slice(0, cutoffAt);

  const totalRefsInCategory = sumBy(details, "count");

  const sx =
    activeDirection === "left" ? { right: width + 8 } : { left: width + 8 };
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        background: "white",
        zIndex: 10,
        p: 2,
        color: "black",
        borderRadius: 0.5,
        ...sx,
      }}
    >
      {details.slice(0, cutoffAt).map((d) => {
        const percent = (d.count / totalRefsInCategory) * 100;
        return (
          <Stack direction="row">
            <div style={{ whiteSpace: "nowrap" }}>{d.name}</div>
            <div style={{ flexGrow: 1, minWidth: 8 }} />
            {includeDetailPercent && (
              <div>
                {percent > 9 ? Math.round(percent) : percent.toFixed(1)}%
              </div>
            )}
          </Stack>
        );
      })}
      {count > cutoffAt && (
        <Box sx={{ whiteSpace: "nowrap" }}>+ {count - cutoffAt} more</Box>
      )}
    </Box>
  );
}

type TooltipData = {
  x: number;
  y: number;
  label: string;
  value: number;
  line: PieData;
};

export function PieChartTMInner({
  data: _data,
  name = "Sections",
  subtitle,
  width = 280,
  includeDetailPercent,
  activeDirection = "right",
  sx,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  hideTooltip,
  showTooltip,
  margin = { left: 0, top: 0, bottom: 0, right: 0 },
}: {
  data: PieData[];
  name: string;
  subtitle: string;
  width?: number;
  includeDetailPercent?: boolean;
  activeDirection?: "right" | "left";
  sx?: SxProps;
  tooltipOpen: boolean;
  tooltipLeft: number;
  tooltipTop: number;
  tooltipData: TooltipData;
}) {
  const data = _data.filter((d) => d.amount);
  const half = width / 2;

  const total = useMemo(
    () => Math.floor(data.reduce((acc, d) => acc + d.amount, 0)),
    [data[0].amount]
  );
  const includesOther = data.some((d) => d.id.toLowerCase() === "other");
  const numCategories = includesOther ? data.length - 1 : data.length;
  let titleText = `${numCategories} ${name}`;
  if (numCategories === 1) {
    titleText = name;
  }

  const tooltipTimeout = useRef<number | undefined>();
  return (
    <Box sx={{ position: "relative", ...sx }}>
      {tooltipData && (
        <ActiveDetail
          active={tooltipData.line}
          width={width}
          includeDetailPercent={includeDetailPercent}
          activeDirection={activeDirection}
        />
      )}
      <svg width={width} height={width}>
        <Group top={half} left={half}>
          <Pie
            data={data}
            pieValue={(data) => data.amount}
            outerRadius={half}
            innerRadius={({ data }) => {
              const size =
                tooltipData && data.id === tooltipData.line.id ? 52 : 40;
              return half - size;
            }}
            cornerRadius={3}
            padAngle={0.005}
          >
            {(pie) => {
              return pie.arcs.map((arc) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);
                return (
                  <g
                    key={arc.data.id}
                    onMouseLeave={() => {
                      tooltipTimeout.current = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={() => {
                      if (tooltipTimeout.current) {
                        clearTimeout(tooltipTimeout.current);
                      }
                      const top = centroidY + margin.top;
                      const left = centroidX + margin.left;
                      showTooltip({
                        tooltipData: {
                          x: top,
                          y: left,
                          label: arc.data.label,
                          value: arc.data.amount,
                          line: arc.data,
                        },
                        tooltipTop: top,
                        tooltipLeft: left,
                      });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <path d={pie.path(arc)} fill={arc.data.color}></path>
                    <Text
                      fill="white"
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fontSize={10}
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {arc.data.label}
                    </Text>
                  </g>
                );
              });
            }}
          </Pie>

          {tooltipOpen ? (
            <>
              <Text
                textAnchor="middle"
                fill="#ccc"
                fontSize={tooltipData.label.length > 10 ? 22 : 28}
                dy={0}
              >
                {tooltipData.label}
              </Text>

              <Text
                textAnchor="middle"
                fill={tooltipData.line.color}
                fontSize={20}
                dy={30}
              >
                {`${tooltipData.value} ${subtitle}`}
              </Text>
            </>
          ) : (
            <>
              <Text textAnchor="middle" fill="#ccc" fontSize={28} dy={0}>
                {titleText}
              </Text>

              <Text textAnchor="middle" fill="#888" fontSize={18} dy={30}>
                {`${total} ${subtitle}`}
              </Text>
            </>
          )}
        </Group>
      </svg>
    </Box>
  );
}

export const PieChartTM = withTooltip(PieChartTMInner);
