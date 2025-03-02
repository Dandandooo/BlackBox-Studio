import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import './DraggableBox.css';

function CustomNode({ id, data }) {
  const {
    inputs = 1,
    outputs = 1,
    inputValues = [],
    inputTypes = [],
    outputValues = [],
    outputTypes = [],
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
      {/* Header Section with Text */}
      <div className={`drag-handle ${minecraftStyle ? 'header minecraft-text' : ''}`}>
        <h3 className="drag-handle-title">
          {label}
        </h3>
      </div>

      {/* Inputs on left side */}
      <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: 0 }}>
        {Array.from({ length: inputs }).map((_, i) => {
          const hasValue = inputValues[i] !== undefined;
          const isNaN = hasValue && Number.isNaN(inputValues[i]);
          const isConnected = hasValue;

          return (
            <div
              key={`input-${i}`}
              style={{
                position: 'relative',
                height: `${100 / Math.max(inputs, 1)}%`,
                width: '20px'
              }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${i}`}
                style={{
                  width: '10px',
                  height: '10px',
                  background: isNaN ? 'red' : (isConnected ? 'green' : 'white')
                }}
              />
              {hasValue && !isNaN && (
                <span
                  className={`value-label ${minecraftStyle ? 'minecraft-text' : ''}`}
                  style={{
                    position: 'absolute',
                    left: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 128, 0, 1)',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}
                >
                  {truncateWithEllipsis(inputValues[i], 8)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Outputs on right side */}
      <div style={{ position: 'absolute', top: '25%', bottom: '25%', right: 0 }}>
        {Array.from({ length: outputs }).map((_, i) => {
          const hasValue = outputValues[i] !== undefined;
          const isNaN = hasValue && Number.isNaN(outputValues[i]);

          return (
            <div
              key={`output-${i}`}
              style={{
                position: 'relative',
                height: `${100 / Math.max(outputs, 1)}%`,
                width: '20px'
              }}
            >
              <Handle
                type="source"
                position={Position.Right}
                id={`output-${i}`}
                style={{
                  width: '10px',
                  height: '10px',
                  background: hasValue && !isNaN ? 'green' : 'red'
                }}
              />
              {hasValue && !isNaN && (
                <span
                  className={`value-label ${minecraftStyle ? 'minecraft-text' : ''}`}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 128, 0, 1)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  {truncateWithEllipsis(outputValues[i], 8)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Node Content */}
      <div className="node-content">
        <div className={`function-display ${minecraftStyle ? 'minecraft-text' : ''}`}>
          {isLampNode ? "" : nodeFunction ? nodeFunction.toString() : "No function defined"}
        </div>
      </div>
    </div>
  );
}

export default memo(CustomNode);
