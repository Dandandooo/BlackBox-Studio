"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ConnectionManager({ children, onUpdateConnections }) {
  const [connections, setConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const containerRef = useRef(null);

  // Check if connecting would form a cycle
  const wouldCreateCycle = (sourceNodeId, targetNodeId) => {
    if (sourceNodeId === targetNodeId) {
      return true;
    }

    const graph = {};
    connections.forEach((conn) => {
      if (!graph[conn.start.nodeId]) {
        graph[conn.start.nodeId] = [];
      }
      graph[conn.start.nodeId].push(conn.end.nodeId);
    });

    // Add the potential new link
    if (!graph[sourceNodeId]) {
      graph[sourceNodeId] = [];
    }
    graph[sourceNodeId].push(targetNodeId);

    // DFS cycle detection
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

  // If user clicks an input circle that's already connected, remove that connection
  // Otherwise, if user clicks an output circle, we begin dragging
  const handleCircleMouseDown = (e) => {
    // Must be a connection point
    if (!e.target.classList.contains("connection-point")) {
      return;
    }

    const type = e.target.dataset.type; // "output" or "input"

    // If it’s an INPUT circle, check for an existing connection, remove it
    if (type === "input") {
      const nodeElement = e.target.closest("[data-node-id]");
      if (!nodeElement) return;

      const targetNodeId = nodeElement.dataset.nodeId;
      const targetId = e.target.dataset.id;

      // Find a connection that ends here
      const connIndex = connections.findIndex(
        (conn) =>
          conn.end.nodeId === targetNodeId &&
          conn.end.type === "input" &&
          conn.end.id === targetId
      );
      if (connIndex > -1) {
        e.stopPropagation();
        const updatedConnections = [
          ...connections.slice(0, connIndex),
          ...connections.slice(connIndex + 1),
        ];
        setConnections(updatedConnections);
        onUpdateConnections?.(updatedConnections);
        return; // Do not start dragging
      }
    }

    // If it’s an OUTPUT circle, we begin dragging
    if (type === "output") {
      const rect = e.target.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const startX = rect.left + rect.width / 2 - containerRect.left;
      const startY = rect.top + rect.height / 2 - containerRect.top;

      const nodeElement = e.target.closest("[data-node-id]");
      const nodeId = nodeElement ? nodeElement.dataset.nodeId : null;

      setDragging({
        startX,
        startY,
        endX: startX,
        endY: startY,
        sourceType: "output",
        sourceId: e.target.dataset.id,
        sourceNodeId: nodeId,
      });
    }
  };

  // Handle drag movement and release
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;

      setDragging((prev) =>
        prev ? { ...prev, endX: relativeX, endY: relativeY } : null
      );
    };

    const handleMouseUp = (e) => {
      if (!dragging) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (
        target &&
        target.classList.contains("connection-point") &&
        target.dataset.type === "input"
      ) {
        // The user dropped the line on an input circle
        const targetRect = target.getBoundingClientRect();
        const endX = targetRect.left + targetRect.width / 2 - containerRect.left;
        const endY = targetRect.top + targetRect.height / 2 - containerRect.top;

        const nodeElement = target.closest("[data-node-id]");
        const targetNodeId = nodeElement ? nodeElement.dataset.nodeId : null;
        const targetId = target.dataset.id;

        // Check if connecting would form a cycle
        if (wouldCreateCycle(dragging.sourceNodeId, targetNodeId)) {
          console.warn("Connection rejected: would create a cycle");
        } else {
          // Remove any previous connection to that same input
          const newConnections = connections.filter(
            (conn) =>
              !(
                conn.end.nodeId === targetNodeId &&
                conn.end.type === "input" &&
                conn.end.id === targetId
              )
          );

          // Add the new connection
          const updatedConnections = [
            ...newConnections,
            {
              start: {
                type: dragging.sourceType,
                id: dragging.sourceId,
                nodeId: dragging.sourceNodeId,
              },
              end: {
                type: "input",
                id: targetId,
                nodeId: targetNodeId,
              },
              startX: dragging.startX,
              startY: dragging.startY,
              endX,
              endY,
            },
          ];

          setConnections(updatedConnections);
          onUpdateConnections?.(updatedConnections);
        }
      }
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, connections, onUpdateConnections]);

  // Sync path endpoints if node positions shift
  const updateConnectionPositions = () => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setConnections((prev) =>
      prev.map((conn) => {
        const startNode = document.querySelector(
          `[data-node-id="${conn.start.nodeId}"]`
        );
        const endNode = document.querySelector(
          `[data-node-id="${conn.end.nodeId}"]`
        );
        if (!startNode || !endNode) return conn;

        const startPoint = startNode.querySelector(
          `.connection-point[data-type="output"][data-id="${conn.start.id}"]`
        );
        const endPoint = endNode.querySelector(
          `.connection-point[data-type="input"][data-id="${conn.end.id}"]`
        );

        if (!startPoint || !endPoint) return conn;

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

  // Indicate whether an input is connected
  const getConnectionStatus = (nodeId, type, id) => {
    if (type === "input") {
      return connections.some(
        (conn) =>
          conn.end.nodeId === nodeId &&
          conn.end.type === "input" &&
          conn.end.id === id
      );
    }
    return false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseDown={handleCircleMouseDown}
    >
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {connections.map((conn, i) => (
          <path
            key={i}
            d={`
              M ${conn.startX} ${conn.startY}
              C ${conn.startX + 50} ${conn.startY},
                ${conn.endX - 50} ${conn.endY},
                ${conn.endX} ${conn.endY}
            `}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        {dragging && (
          <path
            d={`
              M ${dragging.startX} ${dragging.startY}
              C ${dragging.startX + 50} ${dragging.startY},
                ${dragging.endX - 50} ${dragging.endY},
                ${dragging.endX} ${dragging.endY}
            `}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {React.Children.map(children, (child) =>
        React.cloneElement(child, { getConnectionStatus })
      )}
    </div>
  );
}
