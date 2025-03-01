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
  
    // A helper function to update the input values and propagate output updates
    const updateNodeInputsAndOutputs = (nodeId) => {
      const node = updatedNodes[nodeId];
  
      // Update the node's output value based on input values
      updatedNodes[nodeId].outputValues = calculateNodeOutput(node);
  
      // Propagate this node's output to connected nodes
      updatedConnections.forEach((connection) => {
        if (connection.start.nodeId === nodeId) {
          const { end } = connection;
          const outputValue = updatedNodes[nodeId].outputValues[connection.start.id];
          
          // If outputValue is undefined or invalid, reset the input value and output value
          if (outputValue === undefined || outputValue === null) {
            updatedNodes[end.nodeId].inputValues[end.id] = undefined;
            updatedNodes[end.nodeId].outputValues = []; // Clear the output value if input is invalid
          } else {
            updatedNodes[end.nodeId].inputValues[end.id] = outputValue;
            updatedNodes[end.nodeId].outputValues = calculateNodeOutput(updatedNodes[end.nodeId]); // Recalculate output based on new inputs
          }
  
          // Recursively update dependent nodes
          updateNodeInputsAndOutputs(end.nodeId);
        }
      });
    };
  
    updatedConnections.forEach((connection) => {
      // For every connection, update the start node's output and propagate changes
      updateNodeInputsAndOutputs(connection.start.nodeId);
    });
  
    setNodes(updatedNodes);
  };
  
  useEffect(() => {
    const updatedNodes = updateAllNodeOutputs({ ...nodes });
    setNodes(updatedNodes);
  }, [connections]);

  const nodeKeys = Object.keys(nodes);

  return (
    <div className="w-full h-screen bg-gray-800 p-8 flex flex-row overflow-auto">
      <div className="relative w-[3000px] h-[3000px]">
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
    </div>
  );
}
