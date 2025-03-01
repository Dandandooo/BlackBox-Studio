"use client";

import React, { useState, useEffect } from "react";
import DraggableBox from "./DraggableBox";
import ConnectionManager from "./ConnectionManager";

export default function NodeEditor() {
  // -- Node definitions from "updated upstream"
  const [nodes, setNodes] = useState({
    "var x": {
      id: "var x",
      position: { x: 300, y: 0 },
      inputs: 0,
      outputs: 1,
      inputValues: [],
      outputValues: [10],
      nodeFunction: () => 10,
    },
    "var y": {
      id: "var y",
      position: { x: 300, y: 50 },
      inputs: 0,
      outputs: 1,
      inputValues: [],
      outputValues: [30],
      nodeFunction: () => 30,
    },
    "add": {
      id: "add",
      position: { x: 600, y: -192 * 2 },
      inputs: 2,
      outputs: 1,
      inputValues: [],
      outputValues: [],
      nodeFunction: (a, b) => a + b,
    },
    "mult": {
      id: "mult",
      position: { x: 600, y: -192 * 2 + 50 },
      inputs: 2,
      outputs: 1,
      inputValues: [],
      outputValues: [],
      nodeFunction: (a, b) => a * b,
    },
    "div": {
      id: "div",
      position: { x: 900, y: -192 * 4 },
      inputs: 2,
      outputs: 1,
      inputValues: [],
      outputValues: [],
      nodeFunction: (a, b) => a / b,
    },
    "sub": {
      id: "sub",
      position: { x: 900, y: -192 * 4 + 50 },
      inputs: 2,
      outputs: 1,
      inputValues: [],
      outputValues: [],
      nodeFunction: (a, b) => a - b,
    },
  });

  // -- Connections array
  const [connections, setConnections] = useState([]);

  // -- Node creation form state
  const [newNode, setNewNode] = useState({
    id: "",
    inputs: 0,
    outputs: 1,
    position: { x: 0, y: 0 },
    nodeFunction: "",
  });
  const [error, setError] = useState("");

  // -- Logic to compute node output
  const calculateNodeOutput = (node) => {
    if (
      node.nodeFunction &&
      node.inputValues.length === node.inputs &&
      node.inputValues.every((val) => val !== undefined && val !== null)
    ) {
      const result = node.nodeFunction(...node.inputValues);
      return Array.isArray(result) ? result : [result];
    }
    return node.outputValues;
  };

  // -- Apply output calc to every node
  const updateAllNodeOutputs = (updatedNodes) => {
    Object.keys(updatedNodes).forEach((nodeId) => {
      updatedNodes[nodeId].outputValues = calculateNodeOutput(updatedNodes[nodeId]);
    });
    return updatedNodes;
  };

  // -- Called when connections change
  const handleConnectionsUpdate = (updatedConnections) => {
    const updatedNodes = { ...nodes };

    // Update a single node's inputs + outputs based on connections
    const updateNode = (nodeId) => {
      const node = updatedNodes[nodeId];
      if (!node) return;

      // Rebuild input array from connections that end at this node
      const newInputs = Array(node.inputs).fill(undefined);
      updatedConnections.forEach((conn) => {
        if (conn.end.nodeId === nodeId) {
          const startNode = updatedNodes[conn.start.nodeId];
          if (startNode) {
            newInputs[conn.end.id] = startNode.outputValues[conn.start.id];
          }
        }
      });
      node.inputValues = newInputs;

      // If all inputs are valid, compute outputs; otherwise clear
      if (
        node.inputValues.length === node.inputs &&
        node.inputValues.every((val) => val !== undefined && val !== null)
      ) {
        node.outputValues = calculateNodeOutput(node);
      } else {
        node.outputValues = [];
      }
    };

    // Identify all affected nodes and update them
    const affectedNodes = new Set();
    updatedConnections.forEach((conn) => {
      affectedNodes.add(conn.start.nodeId);
      affectedNodes.add(conn.end.nodeId);
    });
    Array.from(affectedNodes).forEach((nodeId) => {
      updateNode(nodeId);
    });

    setNodes(updatedNodes);
  };

  // -- Re-run output calculations whenever connections change
  useEffect(() => {
    const updatedNodes = updateAllNodeOutputs({ ...nodes });
    setNodes(updatedNodes);
  }, [connections]);

  // -- Helpers for creating a new node via the form
  const countFunctionArgs = (funcStr) => {
    const match = funcStr.match(/\(([^)]*)\)/);
    if (match && match[1]) {
      return match[1]
        .split(",")
        .map((arg) => arg.trim())
        .filter((arg) => arg !== "").length;
    }
    return 0;
  };

  const validateNodeId = (id) => {
    if (!id) return "Node ID cannot be empty.";
    if (/\s/.test(id)) return "Node ID cannot contain spaces.";
    if (nodes[id]) return "Node ID already exists.";
    return "";
  };

  const handleAddNode = (e) => {
    e.preventDefault();

    // Validate ID
    const nodeIdError = validateNodeId(newNode.id);
    if (nodeIdError) {
      setError(nodeIdError);
      return;
    }

    // Parse the user function
    let parsedFunction;
    try {
      if (newNode.nodeFunction && typeof newNode.nodeFunction === "string") {
        const func = new Function("return " + newNode.nodeFunction);
        parsedFunction = func();

        const numArgs = countFunctionArgs(newNode.nodeFunction);
        if (numArgs !== newNode.inputs) {
          setError(
            `The number of inputs (${newNode.inputs}) must match the number of function arguments (${numArgs}).`
          );
          return;
        } else {
          setError("");
        }
      } else {
        throw new Error("Function is not provided or invalid");
      }
    } catch (error) {
      console.error("Function evaluation failed:", error.message);
      return;
    }

    // Add the new node to state
    setNodes((prevNodes) => {
      const newNodes = { ...prevNodes };
      const newId = newNode.id;

      // Position the new node below the highest existing node
      const lowestY = Math.min(...Object.values(prevNodes).map((node) => node.position.y));
      const newNodePosition = { x: 300, y: lowestY + 100 };

      newNodes[newId] = {
        id: newId,
        position: newNodePosition,
        inputs: newNode.inputs,
        outputs: newNode.outputs,
        inputValues: [],
        outputValues: newNode.inputs === 0 ? [parsedFunction()] : [],
        nodeFunction: parsedFunction,
      };

      return newNodes;
    });

    // Reset the form
    setNewNode({
      id: "",
      inputs: 0,
      outputs: 1,
      position: { x: 0, y: 0 },
      nodeFunction: "",
    });
  };

  // -- Size of the underlying "canvas"
  const canvasWidth = 5000;
  const canvasHeight = 5000;

  // -- Render
  return (
    <div
      className="flex flex-row overflow-auto p-8"
      style={{
        width: "100vw",
        height: "100vh",
        // Dark overlay + repeating dirt.jpg (or your image):
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/dirt.jpg")',
        backgroundBlendMode: "multiply",
        backgroundRepeat: "repeat",
        // Adjust tile size to your preference:
        backgroundSize: "100px 100px",
      }}
    >
      {/* The big "canvas" area where nodes and connections are placed */}
      <div
        className="relative"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <ConnectionManager onUpdateConnections={handleConnectionsUpdate}>
          {Object.keys(nodes).map((key) => {
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

      {/* Floating form to add a new node, pinned top-left */}
      <div className="absolute top-8 left-8 bg-gray-700 p-4 rounded-md w-[200px]">
        <h2 className="text-white text-lg mb-4">Add Node</h2>
        <form onSubmit={handleAddNode}>
          <div className="mb-2">
            <label className="text-white">Node ID</label>
            <input
              type="text"
              className="p-2 mt-1 w-full"
              value={newNode.id}
              onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
              placeholder="Node ID"
            />
          </div>
          {error && error.includes("Node ID") && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <div className="mb-2">
            <label className="text-white">Number of Inputs</label>
            <input
              type="number"
              className="p-2 mt-1 w-full"
              value={newNode.inputs}
              onChange={(e) =>
                setNewNode({ ...newNode, inputs: parseInt(e.target.value) })
              }
              placeholder="Inputs"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">Number of Outputs</label>
            <input
              type="number"
              className="p-2 mt-1 w-full"
              value={newNode.outputs}
              onChange={(e) =>
                setNewNode({ ...newNode, outputs: parseInt(e.target.value) })
              }
              placeholder="Outputs"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">Function</label>
            <input
              type="text"
              className="p-2 mt-1 w-full"
              value={newNode.nodeFunction}
              onChange={(e) =>
                setNewNode({ ...newNode, nodeFunction: e.target.value })
              }
              placeholder="(a, b) => a + b"
            />
          </div>
          {error && !error.includes("Node ID") && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <button type="submit" className="bg-blue-500 text-white py-2 px-4 mt-4 rounded">
            Add Node
          </button>
        </form>
      </div>
    </div>
  );
}
