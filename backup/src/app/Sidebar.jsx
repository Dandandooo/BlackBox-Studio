import React from 'react';
import { useDnD } from './DnDContext';
import { TbMathXPlusY, TbMathXMinusY, TbMathXy, TbMathXDivideY, TbMathXFloorDivideY, TbXPowerY, TbMathSin, TbMathCos } from 'react-icons/tb';
import { IoEnterOutline } from "react-icons/io5";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";


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
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'add')}
          draggable
          style={{ background: '#eb7184', color: 'black', fontSize: '2rem' }}
        >
          {/* ➕ */}
          <TbMathXPlusY/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'sub')}
          draggable
          style={{ background: '#f38d70', color: 'black', fontSize: '2rem' }}
        >
          {/* ➖ */}
          <TbMathXMinusY/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md black"
          onDragStart={(event) => onDragStart(event, 'mult')}
          draggable
          style={{ background: '#f1cd7a', color: 'black', fontSize: '2rem' }}
        >
          {/* ✖️ */}
          <TbMathXy/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'div')}
          draggable
          style={{ background: '#adda78', color: 'black', fontSize: '2rem' }}
        >
          {/* ➗ */}
          <TbMathXDivideY/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-lg font-bold cursor-pointer shadow-md text-gray-600"
          onDragStart={(event) => onDragStart(event, 'pow')}
          draggable
          style={{ background: '#6ab0f3', color: 'black', fontSize: '2rem' }}
        >
          <TbXPowerY/>
          {/* // */}
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-lg font-bold cursor-pointer shadow-md text-gray-600"
          onDragStart={(event) => onDragStart(event, 'rand')}
          draggable
          style={{ background: '#85dacc', color: 'black', fontSize: '2rem' }}
        >
          {/* x^y */}
          <GiPerspectiveDiceSixFacesRandom/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'sin')}
          draggable
          style={{ background: '#d997c8', color: 'black', fontSize: '2rem' }}
        >
          {/* sin */}
          <TbMathSin/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'cos')}
          draggable
          style={{ background: '#c397d8', color: 'black', fontSize: '2rem' }}
        >
          {/* cos */}
          <TbMathCos/>
        </div>
        <div
          className="dndnode w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center text-gray-600 text-lg font-bold cursor-pointer shadow-md"
          onDragStart={(event) => onDragStart(event, 'out')}
          draggable
          style={{ background: 'linen', color: 'black', fontSize: '2rem'}}
        >
          {/* ➡️ */}
          <IoEnterOutline style={{translate: "-2px"}}/>
        </div>
      </div>
    </aside>
  );
};
