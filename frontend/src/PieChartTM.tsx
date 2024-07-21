import { useState, useMemo } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";

export type PieData = {
  label: string;
  amount: number;
  id: string;
  color?: string;
};

export function PieChartTM({
  data,
  name = "Sections",
  width = 280,
}: {
  data: PieData[];
  name: string;
  width?: number;
}) {
  const [active, setActive] = useState<PieData>();
  const half = width / 2;

  const total = useMemo(
    () => Math.floor(data.reduce((acc, d) => acc + d.amount, 0)),
    []
  );

  return (
    <main>
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
                {`${active.amount} characters`}
              </Text>
            </>
          ) : (
            <>
              <Text textAnchor="middle" fill="#ccc" fontSize={28} dy={0}>
                {`${data.length} ${name}`}
              </Text>

              <Text textAnchor="middle" fill="#888" fontSize={18} dy={30}>
                {`${total} characters`}
              </Text>
            </>
          )}
        </Group>
      </svg>
    </main>
  );
}
