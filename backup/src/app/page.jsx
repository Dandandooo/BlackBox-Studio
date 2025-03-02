"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './DraggableBox.css'; // We'll keep some of your styling

// Custom node component
import CustomNode from './CustomNode';
import { DnDProvider, useDnD } from './DnDContext';

import Sidebar from './Sidebar';

let id = 0;
const getId = () => `dndnode_${id++}`;

// Register custom node types
const nodeTypes = {
  customNode: CustomNode,
};

function NodeEditor() {
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  // Initial nodes based on your existing nodes object
  const initialNodes = [
    {
      id: 'var x',
      type: 'customNode',
      position: { x: 300, y: 0 },
      data: {
        inputs: 0,
        outputs: 1,
        inputValues: [],
        inputTypes: [],
        outputValues: [10],
        outputTypes: ['Number'],
        nodeFunction: () => 10,
        label: 'var x'
      }
    },
    {
      id: 'var y',
      type: 'customNode',
      position: { x: 300, y: 200 },
      data: {
        inputs: 0,
        outputs: 1,
        inputValues: [],
        inputTypes: [],
        outputValues: [30],
        outputTypes: ['Number'],
        nodeFunction: () => 30,
        label: 'var y'
      }
    },
    {
      id: 'add',
      type: 'customNode',
      position: { x: 600, y: 0 },
      data: {
        inputs: 2,
        outputs: 1,
        inputValues: [],
        inputTypes: ['Number', 'Number'],
        outputValues: [],
        outputTypes: ['Number'],
        nodeFunction: (a, b) => a + b,
        label: 'Add'
      }
    },
    {
      id: 'mult',
      type: 'customNode',
      position: { x: 600, y: 200 },
      data: {
        inputs: 2,
        outputs: 1,
        inputValues: [],
        inputTypes: ['Number', 'Number'],
        outputValues: [],
        outputTypes: ['Number'],
        nodeFunction: (a, b) => a * b,
        label: 'Mult'
      }
    },
    {
      id: 'output',
      type: 'customNode',
      position: { x: 400, y: 500 },
      data: {
        inputs: 1,
        outputs: 0,
        inputValues: [],
        inputTypes: ['Any'],
        outputValues: [],
        outputTypes: [],
        nodeFunction: (a, b) => "",
        label: 'Out'
      }
    },
    {
      id: 'div',
      type: 'customNode',
      position: { x: 900, y: 0 },
      data: {
        inputs: 2,
        outputs: 1,
        inputValues: [],
        inputTypes: ['Number', 'Number'],
        outputValues: [],
        outputTypes: ['Number'],
        nodeFunction: (a, b) => a / b,
        label: 'Div'
      }
    },
    {
      id: 'sub',
      type: 'customNode',
      position: { x: 900, y: 200 },
      data: {
        inputs: 2,
        outputs: 1,
        inputValues: [],
        inputTypes: ['Number', 'Number'],
        outputValues: [],
        outputTypes: ['Number'],
        nodeFunction: (a, b) => a - b,
        label: 'Sub'
      }
    },
  ];

  // State for React Flow nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Minecraft styling state
  const [applyMinecraftStyle, setApplyMinecraftStyle] = useState(false);

  // Audio references
  const leverOnRef = useRef(null);
  const leverOffRef = useRef(null);
  const anvilUseRef = useRef(null);
  const chestOpenRef = useRef(null);
  const chestCloseRef = useRef(null);

  // Initialize audio on component mount
  useEffect(() => {
    leverOnRef.current = new Audio("https://storage.googleapis.com/soundboards/Games/MINECRAFT/MP3/LEVELUP%20-%20AUDIO%20FROM%20JAYUZUMI.COM.mp3");
    leverOffRef.current = new Audio("https://storage.googleapis.com/soundboards/Games/MINECRAFT/MP3/NO4%20-%20AUDIO%20FROM%20JAYUZUMI.COM.mp3");
    anvilUseRef.current = new Audio("/anvil_use.wav");
    chestOpenRef.current = new Audio("/chestopen.wav");
    chestCloseRef.current = new Audio("/chestclose.wav");
  }, []);

  // Form state for adding new nodes
  const [newNode, setNewNode] = useState({
    id: '',
    inputs: 0,
    outputs: 1,
    nodeFunction: '',
    inputTypes: [],
    outputTypes: [],
    file: null
  });

  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Track when updates are needed to prevent infinite loops
  const [needsUpdate, setNeedsUpdate] = useState(false);

  // Handle edge connections
  const onConnect = useCallback((params) => {
    // Check if this connection would create a cycle
    if (wouldCreateCycle(params.source, params.target, edges)) {
      console.warn("Connection rejected: would create a cycle");
      return;
    }

    // Find the source and target nodes
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    if (!sourceNode || !targetNode) return;

    // Extract the source and target port indices from the handle IDs
    const sourcePortIndex = params.sourceHandle ? parseInt(params.sourceHandle.split('-')[1]) : 0;
    const targetPortIndex = params.targetHandle ? parseInt(params.targetHandle.split('-')[1]) : 0;

    const sourceType = sourceNode.data.outputTypes[sourcePortIndex];
    const targetType = targetNode.data.inputTypes[targetPortIndex];

    // Allow connection only if types match or if one of them is 'Any'
    if (sourceType !== targetType && sourceType !== 'Any' && targetType !== 'Any') {
      console.warn(`Connection rejected: type mismatch - ${sourceType} cannot connect to ${targetType}`);
      return;
    }

    // Remove any existing connections to this target handle
    const filteredEdges = edges.filter(edge =>
      !(edge.target === params.target && edge.targetHandle === params.targetHandle)
    );

    // Calculate the output value of the source node
    const outputValue = sourceNode.data.outputValues[sourcePortIndex];

    // Determine the edge color based on the output value
    const edgeColor = outputValue ? 'green' : 'red';

    // Add the new edge
    const newEdge = {
      id: `e${params.source}-${sourcePortIndex}-${params.target}-${targetPortIndex}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      // Attach data that we'll need for calculating values
      data: {
        sourcePortIndex,
        targetPortIndex,
        color: edgeColor, // Store the color in the edge data
      },
      style: {
        stroke: edgeColor, // Apply the color directly to the edge
      },
    };

    const edgeForBackend = {
      ida: params.source,
      idb: params.target,
      porta: sourcePortIndex,
      portb: targetPortIndex,
    }
    console.log(edgeForBackend)

    // Set the edges with the filtered list plus the new edge
    setEdges([...filteredEdges, newEdge]);

    // Flag that we need to update values
    setNeedsUpdate(true);
  }, [nodes, edges, setEdges]);


  // Check if a new connection would create a cycle
  const wouldCreateCycle = (sourceNodeId, targetNodeId, currentEdges) => {
    if (sourceNodeId === targetNodeId) {
      return true;
    }

    // Create an adjacency list representation of the graph
    const graph = {};
    currentEdges.forEach(edge => {
      if (!graph[edge.source]) {
        graph[edge.source] = [];
      }
      graph[edge.source].push(edge.target);
    });

    // Add the potential new edge
    if (!graph[sourceNodeId]) {
      graph[sourceNodeId] = [];
    }
    graph[sourceNodeId].push(targetNodeId);

    // DFS to detect cycles
    const visited = new Set();
    const stack = new Set();

    const hasCycle = (nodeId) => {
      if (!nodeId || !graph[nodeId]) return false;
      if (stack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (hasCycle(neighbor)) {
          return true;
        }
      }

      stack.delete(nodeId);
      return false;
    };

    return hasCycle(sourceNodeId);
  };

  // Update node values based on connections
  const updateNodeValues = useCallback(() => {
    // Create a DEEP copy of nodes to modify
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        inputValues: Array(node.data.inputs).fill(undefined),
        // Make sure to preserve inputTypes and outputTypes
        inputTypes: node.data.inputTypes || Array(node.data.inputs).fill('Any'),
        outputTypes: node.data.outputTypes || Array(node.data.outputs).fill('Any')
      }
    }));

    // Calculate node dependencies (topological sort)
    const nodeDependencies = calculateNodeDependencies(updatedNodes, edges);

    // Process nodes in the order of the topological sort
    for (const nodeId of nodeDependencies) {
      const nodeIndex = updatedNodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) continue;

      const node = updatedNodes[nodeIndex];

      // For source nodes with no inputs, calculate outputs
      if (node.data.inputs === 0) {
        try {
          const result = node.data.nodeFunction();
          node.data.outputValues = Array.isArray(result) ? result : [result];
        } catch (error) {
          console.error(`Error calculating output for source node ${nodeId}:`, error);
          node.data.outputValues = [];
        }
        continue;
      }

      // Find all edges that target this node
      const incomingEdges = edges.filter(e => e.target === nodeId);

      // Update input values based on connected nodes' outputs
      incomingEdges.forEach(edge => {
        const sourceNode = updatedNodes.find(n => n.id === edge.source);
        if (!sourceNode) return;

        const sourcePortIndex = parseInt(edge.sourceHandle?.split('-')[1]) || 0;
        const targetPortIndex = parseInt(edge.targetHandle?.split('-')[1]) || 0;

        if (sourceNode.data.outputValues && sourceNode.data.outputValues[sourcePortIndex] !== undefined) {
          node.data.inputValues[targetPortIndex] = sourceNode.data.outputValues[sourcePortIndex];
        }
      });

      // Calculate outputs if all required inputs are valid
      const hasAllRequiredInputs = node.data.inputs === 0 ||
        node.data.inputValues.filter((val, i) => {
          // Check if this input has a connection
          return edges.some(e => e.target === nodeId && parseInt(e.targetHandle?.split('-')[1]) === i);
        }).every(val => val !== undefined);

      if (hasAllRequiredInputs) {
        try {
          // Filter out undefined values from inputs that don't have connections
          const result = node.data.nodeFunction(...node.data.inputValues);

          node.data.outputValues = Array.isArray(result) ? result : [result];
        } catch (error) {
          console.error(`Error calculating output for node ${nodeId}:`, error);
          node.data.outputValues = [];
        }
      } else {
        node.data.outputValues = [];
      }
    }

    // Update the nodes state with completely new node objects
    setNodes(prevNodes => {
      return updatedNodes.map(updatedNode => {
        const prevNode = prevNodes.find(n => n.id === updatedNode.id);
        // Create a new node object with updated data to ensure React detects the change
        return {
          ...prevNode,
          data: {
            ...prevNode.data,
            inputValues: [...updatedNode.data.inputValues],
            outputValues: [...(updatedNode.data.outputValues || [])]
          }
        };
      });
    });

      // **UPDATE EDGE COLORS HERE**
      setEdges(prevEdges => {
        return prevEdges.map(edge => {
          const sourceNode = updatedNodes.find(node => node.id === edge.source);
          if (sourceNode) {
            const outputValue = sourceNode.data.outputValues[edge.data.sourcePortIndex];
            const edgeColor = outputValue ? 'green' : 'red';
            return {
              ...edge,
              data: {
                ...edge.data,
                color: edgeColor
              },
              style: {
                ...edge.style,
                stroke: edgeColor,
                strokeWidth: 3
              }
            };
          }
          return edge;
        });
      });

    // Reset the needs update flag
    setNeedsUpdate(false);
  }, [nodes, edges, setNodes, setEdges]);

  // Calculate the order in which nodes should be processed (topological sort)
  const calculateNodeDependencies = (nodes, edges) => {
    // Create an adjacency list
    const graph = {};
    nodes.forEach(node => {
      graph[node.id] = [];
    });

    edges.forEach(edge => {
      if (!graph[edge.source]) {
        graph[edge.source] = [];
      }
      graph[edge.source].push(edge.target);
    });

    // Topological sort
    const visited = new Set();
    const temp = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (temp.has(nodeId)) return; // Cycle detected
      if (visited.has(nodeId)) return;

      temp.add(nodeId);

      if (graph[nodeId]) {
        for (const neighbor of graph[nodeId]) {
          visit(neighbor);
        }
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      order.unshift(nodeId); // Add to front (reversed for dependency order)
    };

    // Visit each node
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return order;
  };

  // Update values when needed (replaces the previous useEffect that created infinite loop)
  useEffect(() => {
    if (needsUpdate) {
      updateNodeValues();
    }
  }, [needsUpdate, updateNodeValues]);

  // Edge removal handler - ensure values are updated after edge removal
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);

    // Check if any edges were removed
    const hasRemovals = changes.some(change => change.type === 'remove');
    if (hasRemovals) {
      setNeedsUpdate(true);
    }
  }, [onEdgesChange, setNeedsUpdate]);

  // Toggle Minecraft style
  const toggleMinecraftStyle = () => {
    if (!applyMinecraftStyle) {
      leverOnRef.current?.play();
    } else {
      leverOffRef.current?.play();
    }
    setApplyMinecraftStyle(!applyMinecraftStyle);

    // Update nodes with the new style
    setNodes(nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        minecraftStyle: !applyMinecraftStyle
      }
    })));
  };

  // Function to count arguments in a function string
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

  // Validate node ID
  const validateNodeId = (id) => {
    if (!id) return "Node ID cannot be empty.";
    if (/\s/.test(id)) return "Node ID cannot contain spaces.";
    if (nodes.some(node => node.id === id)) return "Node ID already exists.";
    return "";
  };



  // Add a new node
  const handleAddNode = (e) => {
    e.preventDefault();

    const nodeIdError = validateNodeId(newNode.id);
    if (nodeIdError) {
      setError(nodeIdError);
      return;
    }

    let parsedFunction;
    try {
      if (newNode.nodeFunction && typeof newNode.nodeFunction === "string") {
        const func = new Function("return " + newNode.nodeFunction);
        parsedFunction = func();

        const numArgs = countFunctionArgs(newNode.nodeFunction);
        if (numArgs !== parseInt(newNode.inputs)) {
          setError(`The number of inputs (${newNode.inputs}) must match the number of function arguments (${numArgs}).`);
          return;
        } else {
          setError("");
        }
      } else {
        throw new Error("Invalid function");
      }
    } catch (error) {
      console.error("Function evaluation failed:", error.message);
      setError("Function evaluation failed: " + error.message);
      return;
    }

    // **Smart Positioning Logic**
    const nodeSpacingX = 200; // Horizontal spacing
    const nodeSpacingY = 100; // Vertical spacing

    let maxX = 100; // Default starting X
    let maxY = 100; // Default starting Y

    if (nodes.length > 0) {
      maxX = Math.max(...nodes.map(node => node.position.x)) + nodeSpacingX;

      // Find existing Y positions at maxX
      const yPositionsAtMaxX = nodes
        .filter(node => node.position.x === maxX - nodeSpacingX)
        .map(node => node.position.y);

      // Place the new node at a unique Y position
      maxY = Math.max(...yPositionsAtMaxX, maxY) + nodeSpacingY;
    }

    // Create default inputTypes and outputTypes if not provided
    const inputTypes = newNode.inputTypes.length > 0
      ? newNode.inputTypes
      : Array(parseInt(newNode.inputs)).fill('Any');

    const outputTypes = newNode.outputTypes.length > 0
      ? newNode.outputTypes
      : Array(parseInt(newNode.outputs)).fill('Any');

    const newNodeObj = {
      id: newNode.id,
      type: "customNode",
      position: { x: maxX, y: maxY },
      data: {
        inputs: parseInt(newNode.inputs),
        outputs: parseInt(newNode.outputs),
        inputValues: [],
        inputTypes: inputTypes,
        outputValues: parseInt(newNode.inputs) === 0 ? [parsedFunction()] : [],
        outputTypes: outputTypes,
        nodeFunction: parsedFunction,
        label: newNode.id,
        minecraftStyle: applyMinecraftStyle,
      },
    };

    setNodes(prev => [...prev, newNodeObj]);
    if (applyMinecraftStyle) {
      anvilUseRef.current?.play();
    }
    setNewNode({ id: "", inputs: 0, outputs: 1, nodeFunction: "", inputTypes: [], outputTypes: [] });
    setNeedsUpdate(true);
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const nodeTypes = {
        "add" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Add',
            inputs: 2,
            outputs: 1,
            inputValues: [],
            inputTypes: ['Number', 'Number'],
            outputValues: [],
            outputTypes: ['Number'],
            nodeFunction: (a, b) => a + b,
            minecraftStyle: applyMinecraftStyle,
          },
        },
        "sub" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Sub',
            inputs: 2,
            outputs: 1,
            inputValues: [],
            inputTypes: ['Number', 'Number'],
            outputValues: [],
            outputTypes: ['Number'],
            nodeFunction: (a, b) => a - b,
            minecraftStyle: applyMinecraftStyle,
          },
        },
        "mult" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Mult',
            inputs: 2,
            outputs: 1,
            inputValues: [],
            inputTypes: ['Number', 'Number'],
            outputValues: [],
            outputTypes: ['Number'],
            nodeFunction: (a, b) => a * b,
            minecraftStyle: applyMinecraftStyle,
          },
        },
        "div" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Div',
            inputs: 2,
            outputs: 1,
            inputValues: [],
            inputTypes: ['Number', 'Number'],
            outputValues: [],
            outputTypes: ['Number'],
            nodeFunction: (a, b) => a / b,
            minecraftStyle: applyMinecraftStyle,
          },
        },
        "log" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Log',
            inputs: 2,
            outputs: 1,
            inputValues: [],
            inputTypes: ['Number', 'Number'],
            outputValues: [],
            outputTypes: ['Number'],
            nodeFunction: (a, b) => Math.log(a) / Math.log(b),
            minecraftStyle: applyMinecraftStyle,
          },
        },
        "out" : {
          id: getId(),
          type: 'customNode',
          position,
          data: {
            label: 'Out',
            inputs: 1,
            outputs: 0,
            inputValues: [],
            inputTypes: ['Any'],
            outputValues: [],
            outputTypes: [],
            nodeFunction: (a) => {},
            minecraftStyle: applyMinecraftStyle,
          },
        }
      };

      const newNode = nodeTypes[type]

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  // File drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (applyMinecraftStyle) {
      chestCloseRef.current?.play();
    }
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileBrowser = () => {
    // Only open file browser if no file is selected or after file is removed
    if (!newNode.file) {
      if (applyMinecraftStyle) {
        chestOpenRef.current?.play();
      }
      fileInputRef.current.click();
    }
  };

  const handleFile = (file) => {
    // Store file in state
    setNewNode({ ...newNode, file });

    // Optional: if you want to read and process the file immediately
    // For example, read an image file and set it as a node background
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   // Process file content
    // };
    // reader.readAsDataURL(file);
  };

  // Add a new function to handle file removal
  const handleRemoveFile = (e) => {
    e.preventDefault(); // Prevent form submission
    setNewNode({ ...newNode, file: null });

    // Reset the file input element itself
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: applyMinecraftStyle
          ? 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/dirt.jpg")'
          : 'none',
        backgroundColor: applyMinecraftStyle ? 'transparent' : '#333',
        backgroundBlendMode: "multiply",
        backgroundRepeat: "repeat",
        backgroundSize: "100px 100px",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        panOnScroll={true}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Controls>
            <ControlButton onClick={toggleMinecraftStyle}>
              <img
                src={applyMinecraftStyle ? "/lever_off.png" : "/lever_on.png"}
                alt="Minecraft Lever"
                style={{scale:4, translate: "-1.55px"}}
              />
            </ControlButton>
        </Controls>
        <MiniMap
          nodeColor={(node) => {
            if (applyMinecraftStyle) {
              if (node.data.outputs === 0) {
                const fullyConnected =
                node.data.inputs > 0 &&
                node.data.inputValues.length === node.data.inputs &&
                node.data.inputValues.every(val => val !== undefined && !Number.isNaN(val));

                return fullyConnected ? '#FFD700' : '#7d5516'; // Yellow if connected, gray if not
              }
              if (node.data.inputs === 0) return 'red'; // Source node (redblock)
              return '#b09056'; // Normal block color
            }
            return '#6ab0f3'; // use the same blue color as the nodes in regular mode
          }}
          style={{
            backgroundImage: applyMinecraftStyle ? 'url(/white_glass.png)' : 'none',
            backgroundSize: '50px 50px',
            backgroundRepeat: 'repeat',
            borderRadius: '4px',
            // border: applyMinecraftStyle ? '2px solid #000' : 'none',
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
          zoomable
          pannable
        />


        <Background gap={20} variant={applyMinecraftStyle? null : "dots"} />

        <Panel position="top-left">
          <div className="add-menu">

            <h2 className="text-white text-lg mb-4">Add Node</h2>
            <form onSubmit={handleAddNode}>
              <input
                type="text"
                placeholder="Node ID"
                className="add-menu field"
                value={newNode.id}
                onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
              />
              <input
                type="number"
                placeholder="Inputs"
                className="add-menu field"
                value={newNode.inputs}
                onChange={(e) => setNewNode({ ...newNode, inputs: e.target.value })}
              />
              <input
                type="number"
                placeholder="Outputs"
                className="add-menu field"
                value={newNode.outputs}
                onChange={(e) => setNewNode({ ...newNode, outputs: e.target.value })}
              />
              <input
                type="text"
                placeholder="Node Function"
                className="add-menu field"
                value={newNode.nodeFunction}
                onChange={(e) => setNewNode({ ...newNode, nodeFunction: e.target.value })}
              />
              <div className="type-fields">
                <div>
                  <label>Input Types:</label>
                  <input
                    type="text"
                    placeholder="Number,String,Any"
                    className="add-menu field"
                    value={newNode.inputTypes.join(',')}
                    onChange={(e) => {
                      const types = e.target.value.split(',').map(t => t.trim());
                      setNewNode({ ...newNode, inputTypes: types });
                    }}
                  />
                </div>
                <div>
                  <label>Output Types:</label>
                  <input
                    type="text"
                    placeholder="Number,String,Any"
                    className="add-menu field"
                    value={newNode.outputTypes.join(',')}
                    onChange={(e) => {
                      const types = e.target.value.split(',').map(t => t.trim());
                      setNewNode({ ...newNode, outputTypes: types });
                    }}
                  />
                </div>
              </div>

              {/* File drop area */}
              <div
                className={`file-drop-area ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={newNode.file ? null : openFileBrowser} // Only open file browser if no file is selected
              >
                <div className="file-drop-text">
                  {!newNode.file ? (
                    <>
                      <div>Drag & drop a file here</div>
                      <div>or click to browse</div>
                    </>
                  ) : (
                    <>
                      <div>File selected:</div>
                      <div className="file-name">{newNode.file.name}</div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Button container for better layout */}
              <div className="button-container">
                <button
                  type="submit"
                  className="submit-button"
                >
                  Add
                </button>

                {/* Only show remove button when a file is selected */}
                {newNode.file && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </Panel>
        <Panel position="bottom">
          <Sidebar minecraftStyle={applyMinecraftStyle}/>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <NodeEditor />
    </DnDProvider>
  </ReactFlowProvider>
);
