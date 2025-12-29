import React from 'react';
import styled from 'styled-components';
import { useDocument } from '../../application/DocumentStore';
import { Theme, UIButton } from '../../styles/DesignSystem';
import { Trash2 } from 'lucide-react';

const InspectorContainer = styled.div`
  width: 280px;
  background: ${Theme.colors.surface};
  border-left: 1px solid ${Theme.colors.border};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${Theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const PropertyGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #1d1d1f;
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: ${Theme.radius.small};
  border: 1px solid ${Theme.colors.border};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${Theme.colors.primary};
  }
`;

const CheckboxGroup = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
`;

export const Inspector: React.FC = () => {
  const { fields, activeFieldId, updateField, removeField } = useDocument();
  const activeField = fields.find(f => f.id === activeFieldId);

  if (!activeField) {
    return (
      <InspectorContainer>
        <div style={{ color: Theme.colors.secondary, textAlign: 'center', marginTop: 100 }}>
          Select a field to edit its properties
        </div>
      </InspectorContainer>
    );
  }

  return (
    <InspectorContainer>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Field Properties</div>
      
      <SectionTitle>General</SectionTitle>
      <PropertyGroup>
        <Label>Type</Label>
        <div style={{ fontSize: 14, color: Theme.colors.secondary, textTransform: 'capitalize' }}>
          {activeField.type}
        </div>
      </PropertyGroup>

      <PropertyGroup>
        <Label>Placeholder / Label</Label>
        <Input 
          disabled={activeField.type === 'signature'}
          value={activeField.value || ''} 
          onChange={(e) => updateField(activeField.id, { value: e.target.value })}
          placeholder="Enter label..."
        />
      </PropertyGroup>

      <CheckboxGroup>
        <input 
          type="checkbox" 
          checked={activeField.required} 
          onChange={(e) => updateField(activeField.id, { required: e.target.checked })}
        />
        Required Field
      </CheckboxGroup>

      <div style={{ flex: 1 }} />

      <UIButton 
        onClick={() => removeField(activeField.id)}
        style={{ color: Theme.colors.danger, borderColor: Theme.colors.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Trash2 size={16} />
        Remove Field
      </UIButton>
    </InspectorContainer>
  );
};
