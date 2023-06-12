import * as d3 from "d3";
import { useEffect, useRef } from "react";

export const useD3 = (
  renderChartFn: (svg: d3.Selection<d3.BaseType, any, HTMLElement, any>) => any,
  dependencies: any[]
) => {
  const ref = useRef();

  useEffect(() => {
    renderChartFn(d3.select(ref.current));
    return () => {};
  }, dependencies);
  return ref;
};

export function LineChart({
  data,
  keyName = "chapterFlat",
}: {
  keyName: "chapterFlat" | "days";
  data: {
    color: string;
    info: { chapterFlat?: any; days?: any; value: any }[];
  }[];
}) {
  let width = Math.min(750, document.body.offsetWidth - 64);
  let height = Math.min(500, document.body.offsetWidth - 64);
  const ref = useD3(
    (svg) => {
      // Add X axis --> it is a date format
      var x = d3
        .scaleLinear()
        .domain(
          d3.extent(
            data.flatMap((d) => d.info),
            function (d: any) {
              return d[keyName] || "0";
            }
          ) as any
        )
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(
            data.flatMap((d) => d.info),
            function (d: any) {
              return +d.value;
            }
          ),
        ])
        .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));
      debugger;
      data.forEach((d) => {
        // Add the line
        svg
          .append("path")
          .datum(d.info)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 2)
          .attr("class", "myline")
          .attr(
            "d",
            d3
              .line()
              .x(function (d: any) {
                return x(d[keyName]);
              })
              .y(function (d: any) {
                return y(d.value || 0);
              }) as any
          );
      });
    },
    [data]
  );

  return (
    <svg
      ref={ref}
      style={{
        height: height,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >
      <g className="plot-area" />
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
}
