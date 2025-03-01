"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function ConnectionManager({ children, onUpdateConnections }) {
  const [connections, setConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const wouldCreateCycle = (sourceNodeId, targetNodeId) => {
    if (sourceNodeId === targetNodeId) {
      return true;
    }

    const graph = {};
    connections.forEach(conn => {
      if (!graph[conn.start.nodeId]) {
        graph[conn.start.nodeId] = [];
      }
      graph[conn.start.nodeId].push(conn.end.nodeId);
    });

    if (!graph[sourceNodeId]) {
      graph[sourceNodeId] = [];
    }
    graph[sourceNodeId].push(targetNodeId);

    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      if (!nodeId || !graph[nodeId]) return false;
      
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      for (const neighbor of graph[nodeId]) {
        if (hasCycle(neighbor)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };

    return hasCycle(sourceNodeId);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;
        
        setDragging({ 
          ...dragging, 
          endX: relativeX, 
          endY: relativeY 
        });
      }
    };

    const handleMouseUp = (e) => {
      if (dragging) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains('connection-point') && target.dataset.type === 'input') {
          const targetRect = target.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          
          const endX = targetRect.left + targetRect.width / 2 - containerRect.left;
          const endY = targetRect.top + targetRect.height / 2 - containerRect.top;
          
          const targetNodeId = target.closest('[data-node-id]').dataset.nodeId;
          const targetId = target.dataset.id;
          
          if (wouldCreateCycle(dragging.sourceNodeId, targetNodeId)) {
            console.warn("Connection rejected: would create a cycle");
          } else {
            const newConnections = connections.filter(conn => !(
              conn.end.nodeId === targetNodeId && 
              conn.end.type === 'input' && 
              conn.end.id === targetId
            ));
            
            const updatedConnections = [
              ...newConnections,
              {
                start: { type: dragging.sourceType, id: dragging.sourceId, nodeId: dragging.sourceNodeId },
                end: { type: 'input', id: targetId, nodeId: targetNodeId },
                startX: dragging.startX,
                startY: dragging.startY,
                endX: endX,
                endY: endY,
              }
            ];

            // Update the connections state
            setConnections(updatedConnections);

            // Notify the parent with the updated connections
            if (onUpdateConnections) {
              onUpdateConnections(updatedConnections);
            }
          }
        }
        setDragging(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, connections, onUpdateConnections]);

  const handleCircleMouseDown = (e) => {
    if (e.target.classList.contains('connection-point')) {
      if (e.target.dataset.type === 'output') {
        const rect = e.target.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const startX = rect.left + rect.width / 2 - containerRect.left;
        const startY = rect.top + rect.height / 2 - containerRect.top;
        
        const nodeElement = e.target.closest('[data-node-id]');
        const nodeId = nodeElement ? nodeElement.dataset.nodeId : null;
        
        setDragging({
          startX,
          startY,
          endX: startX,
          endY: startY,
          sourceType: e.target.dataset.type,
          sourceId: e.target.dataset.id,
          sourceNodeId: nodeId
        });
      }
    }
  };

  const updateConnectionPositions = () => {
    setConnections(prevConnections => 
      prevConnections.map(conn => {
        const startNode = document.querySelector(`[data-node-id="${conn.start.nodeId}"]`);
        const endNode = document.querySelector(`[data-node-id="${conn.end.nodeId}"]`);
        
        if (!startNode || !endNode) return conn;
        
        const startPoint = startNode.querySelector(`.connection-point[data-type="${conn.start.type}"][data-id="${conn.start.id}"]`);
        const endPoint = endNode.querySelector(`.connection-point[data-type="${conn.end.type}"][data-id="${conn.end.id}"]`);
        
        if (!startPoint || !endPoint) return conn;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const startRect = startPoint.getBoundingClientRect();
        const endRect = endPoint.getBoundingClientRect();
        
        return {
          ...conn,
          startX: startRect.left + startRect.width / 2 - containerRect.left,
          startY: startRect.top + startRect.height / 2 - containerRect.top,
          endX: endRect.left + endRect.width / 2 - containerRect.left,
          endY: endRect.top + endRect.height / 2 - containerRect.top,
        };
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(updateConnectionPositions, 50);
    return () => clearInterval(interval);
  }, []);

  const getConnectionStatus = (nodeId, type, id) => {
    if (type === 'input') {
      return connections.some(conn => 
        conn.end.nodeId === nodeId && 
        conn.end.type === type && 
        conn.end.id === id
      );
    }
    return false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full" onMouseDown={handleCircleMouseDown}>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {connections.map((conn, i) => (
          <path
            key={i}
            d={`M ${conn.startX} ${conn.startY} C ${conn.startX + 50} ${conn.startY}, ${conn.endX - 50} ${conn.endY}, ${conn.endX} ${conn.endY}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        {dragging && (
          <path
            d={`M ${dragging.startX} ${dragging.startY} C ${dragging.startX + 50} ${dragging.startY}, ${dragging.endX - 50} ${dragging.endY}, ${dragging.endX} ${dragging.endY}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          getConnectionStatus: getConnectionStatus 
        })
      )}
    </div>
  );
}
