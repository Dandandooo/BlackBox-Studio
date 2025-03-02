import React from 'react';
import { useDnD } from './DnDContext';

export default () => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex bg-gray-900 bg-opacity-80 border-4 border-gray-700 rounded-lg p-2 shadow-lg">
      <div className="grid grid-cols-9 gap-2">
        <div
          className="dndnode w-16 h-16 bg-blue-500 hover:bg-blue-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'add')}
          draggable
        >
          ➕
        </div>
        <div
          className="dndnode w-16 h-16 bg-green-500 hover:bg-green-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'sub')}
          draggable
        >
          ➖
        </div>
        <div
          className="dndnode w-16 h-16 bg-yellow-500 hover:bg-yellow-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md black"
          onDragStart={(event) => onDragStart(event, 'mult')}
          draggable
        >
          ✖️
        </div>
        <div
          className="dndnode w-16 h-16 bg-red-500 hover:bg-red-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'div')}
          draggable
        >
          ➗
        </div>
        <div
          className="dndnode w-16 h-16 bg-purple-500 hover:bg-purple-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-lg font-bold cursor-pointer shadow-md text-gray-600"
          onDragStart={(event) => onDragStart(event, 'log')}
          draggable
        >
          log
        </div>
        <div
          className="dndnode w-16 h-16 bg-green-500 hover:bg-green-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'nop')}
          draggable
        >
          nop
        </div>
        <div
          className="dndnode w-16 h-16 bg-yellow-500 hover:bg-yellow-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md black"
          onDragStart={(event) => onDragStart(event, 'dup')}
          draggable
        >
          dup
        </div>
        <div
          className="dndnode w-16 h-16 bg-red-500 hover:bg-red-600 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'out')}
          draggable
        >
          out
        </div>
      </div>
    </aside>
  );
};