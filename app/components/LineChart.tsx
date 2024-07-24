import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./LineChart.module.css";

export default function ({ data }) {
  const d3Container = useRef(null);

  const drawChart = () => {
    // Declare the chart dimensions and margins.
    const width = 928;
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

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear(
      [
        d3.min(data, (d) => Number(d.close)) || 0,
        d3.max(data, (d) => Number(d.close) + 5000) || 0,
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
      .y1((p) => y(p.close - marginBottom));

    // Declare the line generator.
    const line = d3
      .line<{ date: string; close: number }>() // Explicitly type the data
      .x((d) => x(new Date(d.date))) // Convert date string to Date object
      .y((d) => y(d.close));

    // Create the SVG container.
    const svg = d3
      .select(d3Container.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

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

    // fill it
    svg
      .append("path")
      .attr("fill", "lightsteelblue")
      // .attr("stroke", "steelblue")
      .attr("d", area(data));

    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", line(data));
  };

  useEffect(() => {
    drawChart();
  }, [d3Container.current]);

  return <svg id="lineChart" ref={d3Container} />;
}
