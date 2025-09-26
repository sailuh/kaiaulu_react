import {useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useDummyData } from "../../hooks/useDummyData.ts";
import './NetworkGraph.css';

export const NetworkGraph = () => {
    const graphContainer = useRef<HTMLDivElement | null>(null);
    const { data } = useDummyData<any>();

    useEffect(() => {
        if (data != null) {
            if (graphContainer.current) {
                const svg = d3.select(graphContainer.current)
                    .append("svg")
                        .attr("width", 1500)
                        .attr("height",1500);


                var link = svg.selectAll("line")
                    .data(data.links)
                    .enter()
                    .append("line")
                    .style("stroke", "#aaa");

                var node = svg
                    .selectAll("circle")
                    .data(data.nodes)
                    .enter()
                    .append("circle")
                    .attr("r", 20)
                    .style("fill", "#69b3a2");

                var simulation = d3.forceSimulation(data.nodes).force("link", d3.forceLink()
                    .id(function(d) {return d.id; }).links(data.links))
                    .force("charge", d3.forceManyBody().strength(-400))
                    .force("center", d3.forceCenter(750, 750))
                    .on("end", ticked);

                function ticked() {
                    link
                        .attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    node
                        .attr("cx", function (d) { return d.x+6; })
                        .attr("cy", function(d) { return d.y-6; });
                }
            }
        }
    }, [data]);

    return (
            <div id={"networkGraph"} ref={graphContainer}>
            </div>
    )

}