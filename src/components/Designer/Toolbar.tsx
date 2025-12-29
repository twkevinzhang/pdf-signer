import React from 'react';
import styled from 'styled-components';
import { MousePointer2, Type, Signature, Calendar, Download } from 'lucide-react';
import { Theme, UIButton } from '../../styles/DesignSystem';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  padding: 8px 16px;
  border-radius: ${Theme.radius.large};
  border: 1px solid ${Theme.colors.border};
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: ${Theme.shadows.medium};
`;

const ToolButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? Theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#fff' : Theme.colors.secondary};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: ${Theme.radius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? Theme.colors.primary : 'rgba(0,0,0,0.05)'};
  }
`;

export const DesignerToolbar: React.FC = () => {
  return (
    <ToolbarContainer>
      <ToolButton active><MousePointer2 size={20} /></ToolButton>
      <div style={{ width: 1, height: 24, background: Theme.colors.border }} />
      <ToolButton><Signature size={20} /></ToolButton>
      <ToolButton><Type size={20} /></ToolButton>
      <ToolButton><Calendar size={20} /></ToolButton>
      <div style={{ width: 1, height: 24, background: Theme.colors.border }} />
      <UIButton primary style={{ height: 40 }}>
        <Download size={18} style={{ marginRight: 8 }} />
        Export PDF
      </UIButton>
    </ToolbarContainer>
  );
};
