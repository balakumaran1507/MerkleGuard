import React, { useEffect, useRef } from "react"
import * as d3 from "d3"

export function MerkleTreeD3({ treeData, driftIndices = [], onNodeClick }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!treeData || !treeData.levels) return

    const margin = { top: 60, right: 60, bottom: 60, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Convert levels to hierarchy
    const levels = treeData.levels
    const buildHierarchy = (levelIdx, nodeIdx) => {
      const hash = levels[levelIdx][nodeIdx]
      const node = { hash, level: levelIdx, index: nodeIdx }

      if (levelIdx > 0) {
        node.children = [
          buildHierarchy(levelIdx - 1, nodeIdx * 2),
          buildHierarchy(levelIdx - 1, nodeIdx * 2 + 1)
        ].filter(n => n.hash !== undefined)
      }
      return node
    }

    const data = buildHierarchy(levels.length - 1, 0)
    const root = d3.hierarchy(data)
    const treeLayout = d3.tree().size([width, height])
    treeLayout(root)

    // Helper to check if a node is on a drift path
    const isDriftSource = (d) => d.data.level === 0 && driftIndices.includes(d.data.index)
    const isOnDriftPath = (d) => {
      if (isDriftSource(d)) return true
      if (d.children) {
        return d.children.some(child => isOnDriftPath(child))
      }
      return false
    }

    // Links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y))
      .attr("fill", "none")
      .attr("stroke", d => isOnDriftPath(d.target) ? "#f59e0b" : "#e5e7eb") // amber-500 : gray-200
      .attr("stroke-width", d => isOnDriftPath(d.target) ? 2 : 1)
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .delay(d => d.target.depth * 50)
      .attr("opacity", 1)

    // Nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => onNodeClick && onNodeClick(d))
      .style("cursor", "pointer")

    node.append("rect")
      .attr("width", 68)
      .attr("height", 22)
      .attr("x", -34)
      .attr("y", -11)
      .attr("rx", 4)
      .attr("fill", d => {
        if (isDriftSource(d)) return "#fef2f2" // red-50
        if (isOnDriftPath(d)) return "#fffbeb" // amber-50
        return "#ffffff" // white
      })
      .attr("stroke", d => {
        if (isDriftSource(d)) return "#fca5a5" // red-300
        if (isOnDriftPath(d)) return "#fcd34d" // amber-300
        return "#d1d5db" // gray-300
      })
      .attr("stroke-width", d => isDriftSource(d) ? 2 : 1)
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .delay(d => d.depth * 50)
      .attr("opacity", 1)

    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("font-family", "Geist Mono")
      .attr("font-size", "9px")
      .attr("font-weight", "600")
      .attr("letter-spacing", "0.05em")
      .attr("fill", d => {
        if (isDriftSource(d)) return "#dc2626" // red-600
        if (isOnDriftPath(d)) return "#d97706" // amber-600
        return "#6b7280" // gray-500
      })
      .text(d => d.data.hash.substring(0, 8))
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .delay(d => d.depth * 50)
      .attr("opacity", 1)

    // Root label
    svg.append("text")
      .attr("x", root.x)
      .attr("y", root.y - 20)
      .attr("text-anchor", "middle")
      .attr("font-family", "Geist Mono")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.05em")
      .attr("fill", "#2563eb") // blue-600
      .text("ROOT")
      .attr("opacity", 0)
      .transition()
      .duration(400)
      .attr("opacity", 1)

  }, [treeData, driftIndices, onNodeClick])

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50/50 rounded-lg p-4 border border-gray-100 overflow-hidden">
      <svg ref={svgRef} width="100%" height="400" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  )
}
