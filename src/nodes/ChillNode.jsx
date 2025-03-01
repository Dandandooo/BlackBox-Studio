import React, { useState, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from "@xyflow/react";

export function ChillNode({data, id}) {

  const safeData = data || {};

  const { setNodes, getEdges } = useReactFlow();

  const [exec, setExec] = useState(safeData.exec || "");

  const connectedEdges = getEdges().filter(edge => edge.target === id || edge.source === id);


  const [leftCount, setLeftCount] = useState(safeData.inputs.length ?? 0);
  const [rightCount, setRightCount] = useState(safeData.outputs.length ?? 0);

  const [nodeHeight, setNodeHeight] = useState(60);

  const updateNodeInternals = useUpdateNodeInternals();


  const calculatedHeight = Math.max(leftCount, rightCount) * 20 + 40;




  useEffect(() => {
    if (nodeHeight !== calculatedHeight) {
      setNodeHeight(calculatedHeight); // Update local state to apply height change

      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                style: { ...node.style, height: calculatedHeight }, // Update node height
              }
            : node
        )
      );

      // Ensure React Flow updates the node dimensions
      setTimeout(() => updateNodeInternals(id), 0);
    }
  }, [leftCount, rightCount, calculatedHeight, id, setNodes, updateNodeInternals, nodeHeight]);


  const handleExecChange = (e) => {
    setExec(e.target.value);
  };

  return (
<div
  className="react-flow__node"
  style={{
    height: `${nodeHeight}px`,
    // minWidth: "150px",
    // padding: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  {safeData.header && <div>{safeData.header}</div>}

  <div>
  {/* Left (input) Handles */}
  {Array.from({ length: leftCount }).map((_, i) => (
    <div key={`left-wrapper-${i}`} style={{ display: "flex", alignItems: "center" }}>
      <Handle
        key={`left-${i}`}
        type="target"
        position={Position.Left}
        id={`left-${i}`}
        // style={{ top: 40 + i * 20 }}
      />
      <div>{safeData.inputs[i]}</div>
    </div>
  ))}
  </div>

  {/* Right (output) Handles */}
  {Array.from({ length: rightCount }).map((_, i) => (
    <div key={`right-wrapper-${i}`} style={{ display: "flex", alignItems: "center" }}>
      <Handle
        key={`right-${i}`}
        type="source"
        position={Position.Right}
        id={`right-${i}`}
        style={{ top: 40 + i * 20 }}
      />
      <div>{safeData.outputs[i]}</div>
    </div>
  ))}
  {/**/}
  <input
        type="text"
        value={exec}
        onChange={handleExecChange}
        style={{ marginBottom: "10px", width: "100px", textAlign: "center" }}
      />
</div>

  );
}
