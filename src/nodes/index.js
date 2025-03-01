import { PositionLoggerNode } from "./PositionLoggerNode";
import { ChillNode } from "./ChillNode";

export const initialNodes = [
  { id: "a", type: "input", position: { x: 0, y: 0 }, data: { label: "wire" } },
  // {
  //   id: "b",
  //   type: "position-logger",
  //   position: { x: -100, y: 100 },
  //   data: { label: "drag me!" },
  // },
  { id: "c", position: { x: 100, y: 100 }, data: { label: "your ideas" } },
  {
    id: "d",
    type: "output",
    position: { x: 0, y: 200 },
    data: { label: "with React Flow" },
  },
  {
    id: "c1",
    type: "chiller",
    position: { x: -200, y: -100 },
    data: {
      header: "Chiller",
      exec: "",
      inputs: ["a1","a2","a3"],
      outputs: ["b1","b2","b3"],
      behaviour_type: 0
    },
  },
  {
    id: "c2",
    type: "chiller",
    position: { x: -200, y: 200 },
    data: {
      header: "Chiller",
      exec: "",
      inputs: [],
      outputs: [],
      behaviour_type: 0
    },
  },
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  "chiller": ChillNode,
  // Add any of your custom nodes here!
};
