import React from 'react';
import styled from 'styled-components';

const Menu = styled.div`
  position: fixed;
  z-index: 10;
  padding: 10px 0;
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  font-size: 14px;

  top: auto;
  left: auto;
  right: auto;
  bottom: auto;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-radius: 0;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export default function PaneContextMenu({ top, left, right, bottom, onAddNode }) {
  return (
    <Menu className="context-menu" top={top} left={left} right={right} bottom={bottom}>
      <MenuItem onClick={onAddNode}>Add Node</MenuItem>
      {/* Add more menu items as needed */}
    </Menu>
  );
}
