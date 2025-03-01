"use client"
import React, { useState, useEffect } from 'react';
import DraggableBox from './DraggableBox';
import ConnectionManager from './ConnectionManager';

export default function NodeEditor() {
  const [nodes, setNodes] = useState({
    "var x": { id: "var x", position: { x: 300, y: 0 }, inputs: 0, outputs: 1, inputValues: [], outputValues: [10], nodeFunction: () => 10 },
    "var y": { id: "var y", position: { x: 300, y: 50 }, inputs: 0, outputs: 1, inputValues: [], outputValues: [30], nodeFunction: () => 30 },
    "add": { id: "add", position: { x: 600, y: -192 * 2 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a + b },
    "mult": { id: "mult", position: { x: 600, y: -192 * 2 + 50 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a * b },
    "div": { id: "div", position: { x: 900, y: -192 * 4 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a / b },
    "sub": { id: "sub", position: { x: 900, y: -192 * 4 + 50 }, inputs: 2, outputs: 1, inputValues: [], outputValues: [], nodeFunction: (a, b) => a - b },
  });

  const [connections, setConnections] = useState([]);
  const [newNode, setNewNode] = useState({
    id: '',
    inputs: 0,
    outputs: 1,
    position: { x: 0, y: 0 },
    nodeFunction: '',
  });

  const [error, setError] = useState('');

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
    const updateNodeInputsAndOutputs = (nodeId) => {
      const node = updatedNodes[nodeId];
      updatedNodes[nodeId].outputValues = calculateNodeOutput(node);

      updatedConnections.forEach((connection) => {
        if (connection.start.nodeId === nodeId) {
          const { end } = connection;
          const outputValue = updatedNodes[nodeId].outputValues[connection.start.id];

          if (outputValue === undefined || outputValue === null) {
            updatedNodes[end.nodeId].inputValues[end.id] = undefined;
            updatedNodes[end.nodeId].outputValues = [];
          } else {
            updatedNodes[end.nodeId].inputValues[end.id] = outputValue;
            updatedNodes[end.nodeId].outputValues = calculateNodeOutput(updatedNodes[end.nodeId]);
          }

          updateNodeInputsAndOutputs(end.nodeId);
        }
      });
    };

    updatedConnections.forEach((connection) => {
      updateNodeInputsAndOutputs(connection.start.nodeId);
    });

    setNodes(updatedNodes);
  };

  const countFunctionArgs = (funcStr) => {
    const match = funcStr.match(/\(([^)]*)\)/);
    if (match && match[1]) {
      return match[1].split(',').map(arg => arg.trim()).filter(arg => arg !== '').length;
    }
    return 0;
  };

  const validateNodeId = (id) => {
    if (!id) return 'Node ID cannot be empty.';
    if (/\s/.test(id)) return 'Node ID cannot contain spaces.';
    if (nodes[id]) return 'Node ID already exists.';
    return '';
  };

  const handleAddNode = (e) => {
    e.preventDefault();

    const nodeIdError = validateNodeId(newNode.id);
    if (nodeIdError) {
      setError(nodeIdError);
      return; // Stop if node ID is invalid
    }

    let parsedFunction;

    // Check if the provided function is valid
    try {
      if (newNode.nodeFunction && typeof newNode.nodeFunction === 'string') {
        const func = new Function('return ' + newNode.nodeFunction);
        parsedFunction = func();

        // Validate function args match inputs
        const numArgs = countFunctionArgs(newNode.nodeFunction);
        if (numArgs !== newNode.inputs) {
          setError(`The number of inputs (${newNode.inputs}) must match the number of function arguments (${numArgs}).`);
          return; // Stop if the validation fails
        } else {
          setError(''); // Clear any existing error
        }
      } else {
        throw new Error('Function is not provided or invalid');
      }
    } catch (error) {
      console.error('Function evaluation failed:', error.message);
      return;
    }

    setNodes(prevNodes => {
      const newNodes = { ...prevNodes };
      const newId = newNode.id;

      // Find the highest y position in the existing nodes
      const lowestY = Math.min(...Object.values(prevNodes).map(node => node.position.y));

      // Position the new node below the lowest node and to the left
      const newNodePosition = { x: 300, y: lowestY + 100 };  // 50px gap below the lowest node

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

    setNewNode({ id: '', inputs: 0, outputs: 1, position: { x: 0, y: 0 }, nodeFunction: '' });
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

      {/* Form to add a new node */}
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
          {error && error.includes('Node ID') && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="mb-2">
            <label className="text-white">Number of Inputs</label>
            <input
              type="number"
              className="p-2 mt-1 w-full"
              value={newNode.inputs}
              onChange={(e) => setNewNode({ ...newNode, inputs: parseInt(e.target.value) })}
              placeholder="Inputs"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">Number of Outputs</label>
            <input
              type="number"
              className="p-2 mt-1 w-full"
              value={newNode.outputs}
              onChange={(e) => setNewNode({ ...newNode, outputs: parseInt(e.target.value) })}
              placeholder="Outputs"
            />
          </div>
          <div className="mb-2">
            <label className="text-white">Function (optional)</label>
            <input
              type="text"
              className="p-2 mt-1 w-full"
              value={newNode.nodeFunction}
              onChange={(e) => setNewNode({ ...newNode, nodeFunction: e.target.value })}
              placeholder="Function"
            />
          </div>
          {error && !error.includes('Node ID') && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <button type="submit" className="bg-blue-500 text-white py-2 px-4 mt-4 rounded">Add Node</button>
        </form>
      </div>
    </div>
  );
}
