import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./style/BubbleGraph.css";

export default function BubbleGraph(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [buzz, setBuzz] = useState([]);
  
  useEffect(() => {
    const url = new URL("http://localhost:8080/orgs/cash-money");
    url.searchParams.set("limit", props.amount);
    url.searchParams.set("offset", 0);

    let data;
    
    fetch(url)
      .then(response => response.json())
      .then(({ results: { wordCountArray } }) => {
        data = wordCountArray;
        setIsLoading(false);
        paint(data);
      });

      
    function paint(data) {
      const width = window.innerWidth;
      const height = 720

      
      const color = d3.scaleOrdinal()
      .domain([0, data[0].value])
      .range(d3.schemeTableau10);
      
      const size = d3.scaleLinear()
      .domain([0, data[0].value])
      .range([5, 100])
      
      const svg = d3.select("svg");
      const circle = svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cy", 60)
      .attr("cx", (d, i) => i * 100 + 30)
      .attr("r", (d) => size(d.value))
      .attr("fill", (d) => color(d.value))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(
        d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
        );
        
        const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(1))
        .force("forceX", d3.forceX().strength(.1).x(width / 2))
        .force("forceY", d3.forceY().strength(.1).y(height / 2))
        .force("collide", d3.forceCollide().strength(.5)
        .radius((d) =>  ((size(d.value)) + 5) )
        .iterations(1)) 
        
        simulation
        .nodes(data)
        .on("tick", (d) => {
          circle
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
        });
        
        const Tooltip = d3.select(".buzz")
        
        function mouseover(e, d) {
          setBuzz([d.key, d.value])
          Tooltip
            .style("opacity", 1)
        }
  
        function mousemove(e, d) {
          Tooltip
            .style("left", (d.x+20) + "px")
            .style("top", (d.y) + "px")
        }
  
        function mouseleave(e, d) {
          Tooltip
            .style("opacity", 0)
        }
        
        function dragstarted() {
          simulation.alphaTarget(.03).restart();
        }
        
        function dragged(e, d) {
          Tooltip
            .style("opacity", 0)
          d3.select(this).attr("cx", d.x = e.x).attr("cy", d.y = e.y);
        }
        
        function dragended() {
          Tooltip
            .style("opacity", 1)
          simulation.alphaTarget(.03);
        }
      }

    }, [])

  if (isLoading) {
    return <div>Ritar</div>;
  }

  return (
    <div className="wrapper">
      <span className="buzz">BuzzWord: "{buzz[0]}" - Förekommer: {buzz[1]} gånger</span>
      <svg width="100%" height="720">
      </svg>
    </div>
  );
}

  
