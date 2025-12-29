import React, { useState } from 'react';
import styled from 'styled-components';
import { MousePointer2, Type, Signature, Calendar, Download } from 'lucide-react';
import { Theme, UIButton } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { FieldFactory, FieldType } from '../../domain/entities/Field';
import { PdfExportService } from '../../domain/services/PdfExportService';

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

const ToolButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? Theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? '#fff' : Theme.colors.secondary};
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
    background: ${props => props.$active ? Theme.colors.primary : 'rgba(0,0,0,0.05)'};
  }
`;

export const DesignerToolbar: React.FC = () => {
  const { addField, file, fields } = useDocument();
  const [activeTool, setActiveTool] = useState<string>('select');

  const handleAddTool = (type: FieldType) => {
    setActiveTool(type);
    const newField = FieldFactory.create(type, 1, 0.1, 0.1);
    addField(newField);
  };

  const handleExportPdf = async () => {
    if (!file) return;
    const bytes = await PdfExportService.export(file, fields);
    const pdfBlob = new Blob([bytes] as any, { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfLink = document.createElement('a');
    pdfLink.href = pdfUrl;
    pdfLink.download = `signed-${file.name}`;
    pdfLink.click();
    URL.revokeObjectURL(pdfUrl);
  };

  const handleExportJson = () => {
    if (!file) return;
    const jsonContent = JSON.stringify({
      documentName: file.name,
      fields: fields.map(f => ({
        id: f.id,
        type: f.type,
        page: f.page,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        required: f.required,
        value: f.value
      }))
    }, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `config-${file.name.replace('.pdf', '')}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);
  };

  return (
    <ToolbarContainer>
      <ToolButton 
        $active={activeTool === 'select'} 
        onClick={() => setActiveTool('select')}
      >
        <MousePointer2 size={20} />
      </ToolButton>
      <div style={{ width: 1, height: 24, background: Theme.colors.border }} />
      
      <ToolButton 
        $active={activeTool === 'signature'} 
        onClick={() => handleAddTool('signature')}
      >
        <Signature size={20} />
      </ToolButton>
      
      <ToolButton 
        $active={activeTool === 'text'} 
        onClick={() => handleAddTool('text')}
      >
        <Type size={20} />
      </ToolButton>
      
      <ToolButton 
        $active={activeTool === 'date'} 
        onClick={() => handleAddTool('date')}
      >
        <Calendar size={20} />
      </ToolButton>
      
      <div style={{ width: 1, height: 24, background: Theme.colors.border }} />
      
      <UIButton style={{ height: 40 }} onClick={handleExportJson}>
        Export JSON
      </UIButton>
      
      <UIButton $primary style={{ height: 40 }} onClick={handleExportPdf}>
        <Download size={18} style={{ marginRight: 8 }} />
        Export PDF
      </UIButton>
    </ToolbarContainer>
  );
};
