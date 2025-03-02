import styled from 'styled-components';
import theme from './theme';

export const AddMenuContainer = styled.div`
  font-family: CaskaydiaCove Nerd Font, monospace;
  background-color: ${theme.primary};
  border: 2px solid ${theme.primaryBorder};
  width: 200px;
  padding: 0.5rem;
  z-index: 50;
  border-radius: 0.5rem;
`;

export const AddMenuField = styled.input`
  background-color: ${theme.primaryDark};
  border: 2px solid ${theme.primaryBorder};
  border-radius: 0.5rem;
  padding: 3px;
  margin-bottom: 0.5rem;
  width: 100%;
  color: ${theme.text};
`;

export const FileDropArea = styled.div`
  width: 100%;
  min-height: 80px;
  border: 2px dashed ${theme.primaryBorder};
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin-bottom: 0.5rem;
  background-color: rgba(225, 112, 80, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(225, 112, 80, 0.5);
  }

  &.active {
    border-color: ${theme.blue};
    background-color: rgba(106, 176, 243, 0.2);
  }
`;

export const FileDropText = styled.div`
  color: ${theme.text};
  font-size: 0.75rem;
  text-align: center;
  margin-bottom: 5px;
`;

export const FileName = styled.div`
  color: ${theme.text};
  font-size: 0.75rem;
  word-break: break-all;
  max-width: 100%;
  margin-top: 5px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 1rem;
  justify-content: flex-start;
  width: 100%;
`;

export const SubmitButton = styled.button`
  background-color: ${theme.success};
  border: 2px solid ${theme.successDark};
  color: ${theme.text};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #9bc56a;
  }
`;

export const RemoveButton = styled.button`
  background-color: ${theme.danger};
  border: 2px solid ${theme.dangerBorder};
  color: ${theme.text};
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;

  &:hover {
    background-color: #d65d70;
  }
`;

export const MenuTitle = styled.h2`
  color: ${theme.text};
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

export const ErrorMessage = styled.p`
  color: ${theme.danger};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;
