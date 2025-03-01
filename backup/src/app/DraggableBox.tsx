"use client";
import Draggable from 'react-draggable';
import { useRef, useState, useEffect } from 'react';

let nodeCounter = 0;

export default function DraggableBox({ 
  children, 
  className, 
  defaultPosition, 
  inputs = 1, 
  outputs = 1, 
  id,
  getConnectionStatus,
  inputValues = [],
  outputValues = [],
  nodeFunction
}) {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState(defaultPosition);
  const [nodeId] = useState(() => id || `node-${nodeCounter++}`);
  const [calculatedOutputs, setCalculatedOutputs] = useState(outputValues);

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  useEffect(() => {
    if (nodeFunction && inputValues.length === inputs && inputValues.every(val => val !== undefined)) {
      const result = nodeFunction(...inputValues);
      setCalculatedOutputs(Array.isArray(result) ? result : [result]);
    } else {
      setCalculatedOutputs([]);
    }
  }, [inputValues, inputs, nodeFunction]);

  useEffect(() => {
    setCalculatedOutputs(outputValues); // Sync outputValues with the parent state
  }, [outputValues]); // Whenever outputValues change, update the state

  return (
    <Draggable 
      nodeRef={nodeRef} 
      defaultPosition={defaultPosition} 
      onDrag={handleDrag}
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        data-node-id={nodeId}
        className={`relative bg-blue-500 w-48 h-48 text-white p-4 rounded-2xl shadow-lg ${className}`}
      >
        {/* Header Section with Text */}
        <div className="drag-handle cursor-move absolute top-0 left-0 right-0 h-8 bg-blue-600 rounded-t-2xl flex justify-between items-center px-2">
          <h3 className="text-white text-sm">{nodeId}</h3> {/* Display Node ID or any other text */}
        </div>

        {/* Inputs */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-center">
          {[...Array(inputs)].map((_, i) => {
            const isConnected = getConnectionStatus && getConnectionStatus(nodeId, 'input', i.toString());
            const value = inputValues[i];
            return (
              <div key={`input-${i}`} className="relative">
                <div 
                  className={`w-3 h-3 rounded-full cursor-pointer connection-point -ml-1.5 ${
                    isConnected ? 'bg-green-400 ring-2 ring-green-200' : 'bg-white'
                  }`} 
                  data-type="input" 
                  data-id={i}
                  title={isConnected ? "Connected" : "Input"}
                  style={{ userSelect: 'none' }} // Add this to disable text selection
                />
                {value !== undefined && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Outputs */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around items-center">
          {[...Array(outputs)].map((_, i) => {
            const value = calculatedOutputs[i];
            return (
              <div key={`output-${i}`} className="relative">
                <div 
                  className="w-3 h-3 bg-white rounded-full cursor-pointer connection-point -mr-1.5" 
                  data-type="output" 
                  data-id={i}
                  title="Output"
                  style={{ userSelect: 'none' }} // Add this to disable text selection
                />
                {value !== undefined && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Node Content */}
        <div className="mt-6" style={{ userSelect: 'none' }}>
          {/* Display nodeFunction as string */}
          <div className="text-xs p-5 text-white overflow-auto" style={{ whiteSpace: 'pre-wrap' }}>
            {nodeFunction ? nodeFunction.toString() : "No function defined"}
          </div>
        </div>
      </div>
    </Draggable>
  );
}
