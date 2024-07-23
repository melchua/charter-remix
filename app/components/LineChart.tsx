import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const dummyQuotes = [
  {
    date: "2021-05-08T00:00:00.000Z",
    high: 59464.61328125,
    volume: 65382980634,
    open: 57352.765625,
    low: 56975.2109375,
    close: 58803.77734375,
    adjclose: 58803.77734375,
  },
  {
    date: "2021-05-09T00:00:00.000Z",
    high: 59210.8828125,
    volume: 65906690347,
    open: 58877.390625,
    low: 56482.00390625,
    close: 58232.31640625,
    adjclose: 58232.31640625,
  },
  {
    date: "2021-05-10T00:00:00.000Z",
    high: 59519.35546875,
    volume: 71776546298,
    open: 58250.87109375,
    low: 54071.45703125,
    close: 55859.796875,
    adjclose: 55859.796875,
  },
  {
    date: "2021-05-11T00:00:00.000Z",
    high: 56872.54296875,
    volume: 61308396325,
    open: 55847.2421875,
    low: 54608.65234375,
    close: 56704.57421875,
    adjclose: 56704.57421875,
  },
  {
    date: "2021-05-12T00:00:00.000Z",
    high: 57939.36328125,
    volume: 75215403907,
    open: 56714.53125,
    low: 49150.53515625,
    close: 49150.53515625,
    adjclose: 49150.53515625,
  },
  {
    date: "2021-05-13T00:00:00.000Z",
    high: 51330.84375,
    volume: 96721152926,
    open: 49735.43359375,
    low: 46980.01953125,
    close: 49716.19140625,
    adjclose: 49716.19140625,
  },
  {
    date: "2021-05-14T00:00:00.000Z",
    high: 51438.1171875,
    volume: 55737497453,
    open: 49682.98046875,
    low: 48868.578125,
    close: 49880.53515625,
    adjclose: 49880.53515625,
  },
  {
    date: "2021-05-15T00:00:00.000Z",
    high: 50639.6640625,
    volume: 59161047474,
    open: 49855.49609375,
    low: 46664.140625,
    close: 46760.1875,
    adjclose: 46760.1875,
  },
  {
    date: "2021-05-16T00:00:00.000Z",
    close: 55859.796875,
    adjclose: 55859.796875,
  },
];

export default function () {
  const d3Container = useRef(null);

  const drawChart = () => {
    // Declare the chart dimensions and margins.
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const xExtent = d3.extent(dummyQuotes, (d) => new Date(d.date)) as [
      Date,
      Date
    ];
    const x = d3.scaleUtc(xExtent || [new Date(), new Date()], [
      marginLeft,
      width - marginRight,
    ]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear(
      [
        d3.min(dummyQuotes, (d) => d.close) || 0,
        d3.max(dummyQuotes, (d) => d.close) || 0,
      ],
      [height - marginBottom, marginTop]
    );

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
          .ticks(width / 200)
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
          .text("↑ Daily close ($)")
      );

    // Append a path for the line.
    svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line(dummyQuotes));

    // // Bind D3 data
    // const update = svg.append("g").selectAll("text").data(data);

    // // Enter new D3 elements
    // update
    //   .enter()
    //   .append("text")
    //   .attr("x", (d, i) => i * 50)
    //   .attr("y", 60)
    //   .style("font-size", 10)
    //   .text((d: number) => `HAA${d}`);

    // // Update existing D3 elements
    // update.attr("x", (d, i) => i * 40).text((d: number) => d);

    // // Remove old D3 elements
    // update.exit().remove();
  };

  useEffect(() => {
    drawChart();
  }, [d3Container.current]);

  return <svg id="lineChart" ref={d3Container} />;
}
