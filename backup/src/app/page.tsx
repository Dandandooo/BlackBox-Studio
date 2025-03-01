"use client";
import React, { useState, useEffect } from 'react';
import DraggableBox from './DraggableBox';
import ConnectionManager from './ConnectionManager';

export default function NodeEditor() {
  const [nodes, setNodes] = useState({
    "var x": { id: "var x", position: { x: 0, y: 0 }, inputs: 0, outputs: 1, inputValues: [], outputValues: [10], nodeFunction: () => 10 },
    "var y": { id: "var y", position: { x: 0, y: 50 }, inputs: 0, outputs: 1, inputValues: [], outputValues: [30], nodeFunction: () => 30 },
    "add": { id: "add", position: { x: 300, y: -192*2 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a + b },
    "mult": { id: "mult", position: { x: 300, y: -192*2 + 50 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a * b },
    "div": { id: "div", position: { x: 600, y: -192*4 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a / b },
    "sub": { id: "sub", position: { x: 600, y: -192*4 + 50 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a - b },
  });

  const [connections, setConnections] = useState([]);

  const calculateNodeOutput = (node) => {
    if (node.nodeFunction && node.inputValues.length === node.inputs && node.inputValues.every(val => val !== undefined)) {
      const result = node.nodeFunction(...node.inputValues);
      return Array.isArray(result) ? result : [result];
    }
    return node.outputValues;
  };

  const updateAllNodeOutputs = (updatedNodes) => {
    Object.keys(updatedNodes).forEach(nodeId => {
      updatedNodes[nodeId].outputValues = calculateNodeOutput(updatedNodes[nodeId]);
    });
    return updatedNodes;
  };

  const handleConnectionsUpdate = (updatedConnections) => {
    const updatedNodes = { ...nodes };
  
    updatedConnections.forEach((connection) => {
      const { start, end } = connection;
      const outputValue = nodes[start.nodeId]?.outputValues[start.id];
  
      if (outputValue !== undefined) {
        updatedNodes[end.nodeId].inputValues[end.id] = outputValue;
      }
    });
  
    // Update the output values for all nodes after input values are updated
    const nodesWithUpdatedOutputs = updateAllNodeOutputs(updatedNodes);
  
    // Set the nodes state with the updated nodes (input and output values)
    setNodes(nodesWithUpdatedOutputs);
  
    // Filter out unnecessary connection data
    const filteredConnections = updatedConnections.map(connection => {
      const { startX, startY, endX, endY, ...rest } = connection;
      return rest;
    });
  
    // Update the connections state
    setConnections(filteredConnections);
  };

  useEffect(() => {
    const updatedNodes = updateAllNodeOutputs({ ...nodes });
    setNodes(updatedNodes);
  }, [connections]);

  const nodeKeys = Object.keys(nodes);

  return (
    <div className="w-screen h-screen bg-gray-800 p-8 flex flex-row">
      <div className="pr-10">
        <h2>Connections:</h2>
        <pre>{JSON.stringify(connections, null, 2)}</pre>
        <h3>Node Data:</h3>
        <pre>{JSON.stringify(nodes, null, 2)}</pre>
      </div>
      <ConnectionManager onUpdateConnections={handleConnectionsUpdate}>
        {nodeKeys.map((key) => {
          const node = nodes[key];
          return (
            <DraggableBox
              key={node.id}
              id={node.id}
              defaultPosition={node.position}
              inputs={node.inputs}
              outputs={node.outputs}
              inputValues={node.inputValues}
              outputValues={node.outputValues}
              nodeFunction={node.nodeFunction}
            >
              {node.id}
            </DraggableBox>
          );
        })}
      </ConnectionManager>
    </div>
  );
}
