"use client";
import Draggable from 'react-draggable';
import { useRef, useState, useEffect } from 'react';
import './DraggableBox.css';

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
        className={`draggable-box ${className}`}
      >
        {/* Header Section with Text */}
        <div className="drag-handle">
          <h3 className="drag-handle-title">{nodeId}</h3>
        </div>

        {/* Inputs */}
        <div className="connection-container input-container">
          {[...Array(inputs)].map((_, i) => {
            const isConnected = getConnectionStatus && getConnectionStatus(nodeId, 'input', i.toString());
            const value = inputValues[i];
            return (
              <div key={`input-${i}`} className="connection-point-wrapper">
                <div
                  className={`connection-point input-point ${isConnected ? 'connected' : ''}`}
                  data-type="input"
                  data-id={i}
                  title={isConnected ? "Connected" : "Input"}
                >
                  {isConnected && value !== undefined ? (
                    <span className="value-label">{value}</span>
                  ) : null}
                </div>
                {!isConnected && value !== undefined && (
                  <span className="value-label input-value external">
                    {value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Outputs */}
        <div className="connection-container output-container">
          {[...Array(outputs)].map((_, i) => {
            const value = calculatedOutputs[i];
            return (
              <div key={`output-${i}`} className="connection-point-wrapper">
                <div
                  className="connection-point output-point"
                  data-type="output"
                  data-id={i}
                  title="Output"
                >
                  {value !== undefined && (
                    <span className="value-label output-value">
                      {value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Content */}
        <div className="node-content">
          {/* Display nodeFunction as string */}
          <div className="function-display">
            {nodeFunction ? nodeFunction.toString() : "No function defined"}
          </div>
        </div>
      </div>
    </Draggable>
  );
}
