import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { bisector } from "d3-array"; // Import bisector from d3-array
import { USDollar } from "~/utils/quoteUtils";

export default function ({ data }) {
  const d3Container = useRef(null);
  const bisect = bisector((d: { date: string }) => new Date(d.date)).left;

  const drawChart = () => {
    d3.selectAll("svg > *").remove();

    // Chart dimensions and margins.
    const width = 1000;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const xExtent = d3.extent(data, (d) => new Date(d.date)) as [Date, Date];
    const x = d3.scaleUtc(xExtent || [new Date(), new Date()], [
      marginLeft,
      width - marginRight,
    ]);

    // Y scale
    const y = d3.scaleLinear(
      [
        d3.min(data, (d) => Number(d.close)) || 0,
        d3.max(data, (d) => Number(d.close)) || 0,
      ],
      [height - marginBottom, marginTop]
    );

    // Shaded area beneath the line
    var area = d3
      .area()
      .x((p) => {
        return x(new Date(p.date));
      })
      .y0((p) => height - marginBottom)
      .y1((p) => y(p.close)); // 0.1 is a hack for this

    // Line generator function
    const line = d3
      .line<{ date: string; close: number }>()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.close));

    // Used to show individual stock info tooltip when hoving over chart
    const pointermoved = (event: MouseEvent) => {
      svg.selectAll("#tooltip").remove(); // Remove existing tooltip
      const i = bisect(data, x.invert(d3.pointer(event)[0]));
      const tooltip = svg
        .append("g")
        .attr("id", "tooltip")
        .style("display", "block");

      tooltip
        .append("rect")
        .attr("width", 120)
        .attr("height", 75)
        .attr("r", 50)
        .attr("fill", "white")
        .attr("opacity", "0.76")
        .attr("rx", "4")
        .attr(
          "transform",
          `translate(${x(new Date(data[i].date))}, ${y(
            new Date(data[i].close)
          )})`
        );

      const textGroup = tooltip.append("g");
      const date = new Date(data[i].date);

      textGroup
        .append("text")
        .text(`${USDollar.format(data[i].close)}`)
        .attr("x", x(new Date(data[i].date)) + 20)
        .attr("y", y(new Date(data[i].close)) + 28)
        .style("fill", "black")
        .style("font", "16px sans-serif")
        .style("font-weight", "bold");

      textGroup
        .append("text")
        .text(`${date.toLocaleDateString("en-US")}`)
        .attr("x", x(new Date(data[i].date)) + 28)
        .attr("y", y(new Date(data[i].close)) + 56)
        .style("fill", "black")
        .style("font", "14px sans-serif");
    };

    const pointerleft = () => {
      svg.selectAll("#tooltip").remove();
    };

    // Create the main SVG chart container.
    const svg = d3
      .select(d3Container.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        "max-width: 100%; height: auto; height: intrinsic; min-height: 500px; min-width: 700px; overflow: visible;"
      )
      .on("pointerenter pointermove", pointermoved)
      .on("pointerleave", pointerleft);

    // Add the x-axis.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    // Add the y-axis, remove the domain line, add grid lines and a label.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
      );

    // Shading underneath the chart line
    // svg.append("path").attr("fill", "lightsteelblue").attr("d", area(data));

    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", line(data));
  };

  useEffect(() => {
    drawChart();
  }, [d3Container.current, data]);

  return <svg id="lineChart" ref={d3Container} />;
}
