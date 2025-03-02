import { PositionLoggerNode } from "./PositionLoggerNode";
import { ChillNode } from "./ChillNode";

export const initialNodes = [
  // { id: "a", type: "input", position: { x: 0, y: 0 }, data: { label: "wire" } },
  // {
  //   id: "b",
  //   type: "position-logger",
  //   position: { x: -100, y: 100 },
  //   data: { label: "drag me!" },
  // },
  // { id: "c", position: { x: 100, y: 100 }, data: { label: "your ideas" } },
  // {
  //   id: "d",
  //   type: "output",
  //   position: { x: 0, y: 200 },
  //   data: { label: "with React Flow" },
  // },
  {
    id: "add",
    type: "chiller",
    position: { x: -200, y: 0 },
    data: {
      header: "add",
      exec: "",
      inputs: ["x1","x2"],
      outputs: ["y1"],
      behaviour_type: 0
    },
  },
  {
    id: "sub",
    type: "chiller",
    position: { x: 0, y: 0 },
    data: {
      header: "Chiller",
      exec: "",
      inputs: ["x1", "x2"],
      outputs: ["y1"],
      behaviour_type: 0
    },
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  "chiller": ChillNode,
  // Add any of your custom nodes here!
};
