import { useCallback, useState, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import NodeContextMenu from "./nodes/NodeContextMenu";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";

import styled, { ThemeProvider } from "styled-components";
import { Light, Dark } from "./theme";
import ThemeSwitcher from "./ThemeSwitcher";


const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${(props) => props.theme.bg};
  background-image: ${(props) => props.theme.bgImage};

  .react-flow__node {
    color: ${(props) => props.theme.primary};
    background-color: ${(props) => props.theme.nodeBg};
    border: 2px solid ${(props) => props.theme.nodeBorder};
  }

  .react-flow__node:hover {
    box-shadow: 0 2px 4px ${(props) => props.theme.nodeBorder};
  }

  .react-flow__node.selected {
    border-color: ${(props) => props.theme.selection};
    outline: none;
    --xy-node-boxshadow-selected-default: none;
  }

  .react-flow__node.selected:hover {
    box-shadow: 0 2px 4px ${(props) => props.theme.selection};
  }

  .react-flow__edge.selected {
    --xy-edge-stroke-selected-default: ${(props) => props.theme.selection};
  }

  .react-flow__minimap {
    background-color: ${(props) => props.theme.bg};
  }

  .react-flow__minimap-mask {
    fill: ${(props) => props.theme.bg2};
  }

  .react-flow__minimap-node {
    fill: ${(props) => props.theme.nodeBg};
  }

  .react-flow__controls-button {
    border: 2px solid ${(props) => props.theme.controlBorder};
    background-color: ${(props) => props.theme.controlBg};
    color: ${(props) => props.theme.primary};
  }

  .react-flow__handle {
    background-color: ${(props) => props.theme.handleGoodBg};
    border: 2px solid ${(props) => props.theme.handleBorder};
  }

  .context-menu {
    background-color: ${(props) => props.theme.controlBg};
    border: 2px solid ${(props) => props.theme.controlBorder};
    color: ${(props) => props.theme.primary};
  }

  .context-menu button {
    background-color: ${(props) => props.theme.controlBg};
    color: ${(props) => props.theme.primary};
  }
`;


export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeMenu, setNodeMenu] = useState(null);
  const [paneMenu, setPaneMenu] = useState(null);
  const [theme, setTheme] = useState("light");
  const ref = useRef(null);

  const onConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setNodeMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setNodeMenu],
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      // Prevent default context menu
      event.preventDefault();

      // Close node menu if it's open
      setNodeMenu(null);

      // Calculate position for the pane context menu
      const pane = ref.current.getBoundingClientRect();
      setPaneMenu({
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setPaneMenu, setNodeMenu]
  );

  const onNodeClick = useCallback(() => {
      setNodeMenu(null),
      setPaneMenu(null)
  }, [setNodeMenu, setPaneMenu]);

  const handleAddNode = useCallback(() => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: "default",
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      },
    };
    onNodesChange([...nodes, newNode]);
  })


  return (
    <ThemeProvider theme={theme === "light" ? Light : Dark}>
      <ReactFlowStyled
        ref={ref}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}

        onPaneClick={useCallback(() => setNodeMenu(null), [setNodeMenu])}
        // onContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        panOnScroll={true}
        zoomOnScroll={false}
        elementsSelectable={true}
        onConnect={onConnect}
        // colorMode={ThemeSwitcher.}
        fitView
      >
        <Background/>
        {paneMenu && <NodeContextMenu {...paneMenu} onAddNode={handleAddNode} />}
        {nodeMenu && <NodeContextMenu {...nodeMenu} />}
        <MiniMap />
        <Controls />
        <ThemeSwitcher currentTheme={theme} setTheme={setTheme} />
      </ReactFlowStyled>
    </ThemeProvider>
  );
}
