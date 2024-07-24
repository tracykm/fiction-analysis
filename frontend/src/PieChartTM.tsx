import { useState, useMemo } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { Box, Stack } from "@mui/material";
import { sortBy, sumBy } from "lodash-es";

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
}: {
  active: PieData;
  width: number;
  includeDetailPercent?: boolean;
}) {
  const cutoffAt = 12;
  const count = active.detail.length;

  let details = sortBy(active.detail, (d) => d.count * -1);
  details = details.slice(0, cutoffAt);

  const totalRefsInCategory = sumBy(details, "count");

  return (
    <Box
      sx={{
        position: "absolute",
        left: width + 8,
        top: 0,
        background: "black",
        zIndex: 10,
        p: 2,
        opacity: 0.8,
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

export function PieChartTM({
  data: _data,
  name = "Sections",
  subtitle,
  width = 280,
  includeDetailPercent,
}: {
  data: PieData[];
  name: string;
  subtitle: string;
  width?: number;
  includeDetailPercent?: boolean;
}) {
  const data = _data.filter((d) => d.amount);
  const [active, setActive] = useState<PieData | undefined>();
  const half = width / 2;

  const total = useMemo(
    () => Math.floor(data.reduce((acc, d) => acc + d.amount, 0)),
    [data[0].amount]
  );
  return (
    <Box sx={{ position: "relative" }}>
      {active && (
        <ActiveDetail
          active={active}
          width={width}
          includeDetailPercent={includeDetailPercent}
        />
      )}
      <svg width={width} height={width}>
        <Group top={half} left={half}>
          <Pie
            data={data}
            pieValue={(data) => data.amount}
            outerRadius={half}
            innerRadius={({ data }) => {
              const size = active && data.id === active.id ? 52 : 40;
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
                    onMouseEnter={() => setActive(arc.data)}
                    onMouseLeave={() => setActive()}
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

          {active ? (
            <>
              <Text textAnchor="middle" fill="#ccc" fontSize={28} dy={0}>
                {active.label}
              </Text>

              <Text
                textAnchor="middle"
                fill={active.color}
                fontSize={20}
                dy={30}
              >
                {`${active.amount} ${subtitle}`}
              </Text>
            </>
          ) : (
            <>
              <Text textAnchor="middle" fill="#ccc" fontSize={28} dy={0}>
                {`${data.length} ${name}`}
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
