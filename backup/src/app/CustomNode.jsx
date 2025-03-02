import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import './DraggableBox.css';

function CustomNode({ id, data }) {
  const {
    inputs = 1,
    outputs = 1,
    inputValues = [],
    inputTypes = [], // Now using inputTypes array
    outputValues = [],
    outputTypes = [], // Now using outputTypes array
    nodeFunction,
    label,
    minecraftStyle = false
  } = data;

  const isLampNode = outputs === 0;
  const hasAllInputsConnected =
  inputs > 0 &&
  inputValues.length === inputs &&
  inputValues.every(val => val !== undefined && !Number.isNaN(val));

  const nodeBackgroundImage = minecraftStyle
    ? isLampNode
      ? hasAllInputsConnected
        ? 'url("/redstone_lamp_on.png")'
        : 'url("/redstone_lamp_off.png")'
      : inputs === 0
      ? 'url("/redstone_block.png")'
      : 'url("/command_block.png")'
    : 'none';

  const backgroundImage =
    minecraftStyle && inputs === 0
      ? 'url("/redstone_block.png")'
      : minecraftStyle
      ? 'url("/command_block.png")'
      : 'none';

  // Helper function to truncate with ellipsis
  const truncateWithEllipsis = (value, maxLength = 5) => {
    const stringValue = value.toString();
    if (stringValue.length <= maxLength) {
      return stringValue;
    }
    return `${stringValue.substring(0, maxLength)}...`;
  };

  // Helper to get color for type indicators
  const getTypeColor = (type) => {
    const typeColors = {
      'Number': '#ff9800',  // Orange for numbers
      'String': '#4caf50',  // Green for strings
      'Bool': '#2196f3', // Blue for booleans
      'Array': '#9c27b0',  // Purple for objects
      'Json': '#e91e63',   // Pink for arrays
      'FreeJson': '#607d8b',
    };
    return typeColors[type] || '#999999';
  };

  // Format function display to be more readable
  const formatFunctionDisplay = () => {
    if (isLampNode) {
      // For output nodes, show the input value instead of the function
      if (hasAllInputsConnected && inputValues[0] !== undefined) {
        return `Output: ${inputValues[0]}`;
      }
      return "Waiting for input...";
    }

    if (!nodeFunction) return "No function defined";

    const funcStr = nodeFunction.toString();
    // Remove function boilerplate to just show the operation
    const simplifiedFunc = funcStr.replace(/\(.*\)\s*=>\s*/, '');
    return simplifiedFunc;
  };

  return (
    <div
      className={`draggable-box ${minecraftStyle ? 'minecraft' : ''}`}
      style={{
        backgroundImage: nodeBackgroundImage,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Node Content - Centered function display (now covers entire box) */}
      <div className="node-content">
        <div className={`function-display ${minecraftStyle ? 'minecraft-text' : ''}`}>
          {formatFunctionDisplay()}
        </div>
      </div>

      {/* Header Section with Text (moved after node-content to ensure proper z-index stacking) */}
      <div className={`drag-handle ${minecraftStyle ? 'header minecraft-text' : ''}`}>
        <h3 className="drag-handle-title">
          {label}
        </h3>
      </div>

      {/* Inputs on left side */}
      <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: 0, zIndex: 2 }}>
        {Array.from({ length: inputs }).map((_, i) => {
          const hasValue = inputValues[i] !== undefined;
          const isNaN = hasValue && Number.isNaN(inputValues[i]);
          const isConnected = hasValue;
          const inputType = inputTypes[i] || 'Any';

          return (
            <div
              key={`input-${i}`}
              style={{
                position: 'relative',
                height: `${100 / Math.max(inputs, 1)}%`,
              }}
            >
              {!(hasValue && !isNaN) && (<span
                className={`type-label ${minecraftStyle ? 'minecraft-text' : ''}`}
                style={{
                  backgroundColor: getTypeColor(inputType),
                  left: '10px'
                }}
              >
                {inputType}
              </span>)}
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${i}`}
                style={{ background: isNaN ? 'red' : (isConnected ? 'green' : 'white'), }}
              >
              {/* Only show the value label on the handle if this is NOT an output node */}
              {hasValue && !isNaN && !isLampNode && (
                <span className={`value-label ${minecraftStyle ? 'minecraft-text' : ''}`} >
                  {inputValues[i]}
                </span>
              )}
              </Handle>
            </div>
          );
        })}
      </div>

      {/* Outputs on right side */}
      <div style={{ position: 'absolute', top: '25%', bottom: '25%', right: 0, zIndex: 2 }}>
        {Array.from({ length: outputs }).map((_, i) => {
          const hasValidOutputValue = outputValues[i] !== undefined && outputValues[i] !== null && !Number.isNaN(outputValues[i]);
          const outputType = outputTypes[i] || 'Any';

          return (
            <div
              key={`output-${i}`}
              style={{
                position: 'relative',
                height: `${100 / Math.max(outputs, 1)}%`,
              }}
            >
              <span
                className={`type-label ${minecraftStyle ? 'minecraft-text' : ''}`}
                style={{
                  backgroundColor: getTypeColor(outputType),
                  right: '16px',
                }}
              >
                {outputType}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${i}`}
                style={{ background: hasValidOutputValue ? 'green' : 'red', }}
              >
              {/* Type indicator */}
              {hasValidOutputValue && (
                <span className={`value-label ${minecraftStyle ? 'minecraft-text' : ''}`} >
                  {outputValues[i]}
                </span>
              )}
              </Handle>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CustomNode);
