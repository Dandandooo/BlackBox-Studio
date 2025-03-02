import React, { useState, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from "@xyflow/react";
import styled from "styled-components";

const text = styled.div`
  font-family: Zapfino;
  font-size: .5rem;
`

export function ChillNode({data, id}) {

  const safeData = data || {};

  const { setNodes, getEdges } = useReactFlow();

  const [exec, setExec] = useState(safeData.exec || "");

  const connectedEdges = getEdges().filter(edge => edge.target === id || edge.source === id);


  const [leftCount, setLeftCount] = useState(safeData.inputs.length ?? 0);
  const [rightCount, setRightCount] = useState(safeData.outputs.length ?? 0);

  const updateNodeInternals = useUpdateNodeInternals();


  const calculatedHeight = Math.max(leftCount, rightCount) * 20 + 40;




  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              style: { ...node.style}, // Update node height
            }
          : node
      )
    );

    // Ensure React Flow updates the node dimensions
    setTimeout(() => updateNodeInternals(id), 0);
  }, [leftCount, rightCount, calculatedHeight, id, setNodes, updateNodeInternals]);


  const handleExecChange = (e) => {
    setExec(e.target.value);
  };

  return (
<div
  style={{
    // height: `${nodeHeight}px`,
    minHeight: Math.max(leftCount, rightCount) * 20 + 40,
    minWidth: "100px",
    // minHeight: "24px",
    // padding: "10px",
    display: "block",
    paddingInline: "30px",
    overflow: "hidden",
    // flexDirection: "column",
    // alignItems: "center",
    // objectFit: "contain",
  }}
>
  <div style={{textAlign: "center", position: "sticky", width:"100%", height: "1.5rem", objectFit: "contain"}}>
    {safeData.header}
  </div>
  {/* {safeData.header && <div>{safeData.header}</div>} */}
  <div>

  {/* Left (input) Handles */}
  <div style={{display: "flex", flexDirection: "column", position: "fixed", left: "0", justifyContent: "space-evenly", height: "80%", bottom: "0"}}>
    {Array.from({ length: leftCount }).map((_, i) => (
      <div style={{display: "inline-block"}}>
        <Handle
          key={`left-${i}`}
          type="target"
          position={Position.Left}
          id={`left-${i}`}
          style={{ top: (i + 1) * (60/(leftCount+1)) }}
          // style={{position: "relative"}}
        />
        <text>{safeData.inputs[i]}</text>
      </div>
    ))}
  </div>
  {/* <input
        type="text"
        value={exec}
        onChange={handleExecChange}
        style={{ marginBottom: "10px", width: "100px", textAlign: "center" }}
      /> */}

  <div style={{display: "flex", flexDirection: "column", position: "absolute", right: "0", justifyContent: "space-evenly", height: "80%", bottom: "0"}}>
    {/* Right (output) Handles */}
    {Array.from({ length: rightCount }).map((_, i) => (
      <div>
        <text>{safeData.inputs[i]}</text>
        <Handle
          key={`right-${i}`}
          type="source"
          position={Position.Right}
          id={`right-${i}`}
          style={{ top: (i + 1) * (60/(rightCount+1)) }}
        />
      </div>
    ))}
  </div>
  </div>
</div>

  );
}
