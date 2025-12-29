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
  const { fields, activeFieldId, updateField, removeField, appMode } = useDocument();
  const activeField = fields.find(f => f.id === activeFieldId);
  const isDesigner = appMode === 'designer';

  if (!activeField) {
    return (
      <InspectorContainer>
        <div style={{ color: Theme.colors.secondary, textAlign: 'center', marginTop: 100 }}>
          {isDesigner ? 'Select a field to edit its properties' : 'Select a field to fill'}
        </div>
      </InspectorContainer>
    );
  }

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (prev) => {
        updateField(activeField.id, { value: prev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <InspectorContainer>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        {isDesigner ? 'Field Properties' : 'Fill Information'}
      </div>
      
      <SectionTitle>General</SectionTitle>
      <PropertyGroup>
        <Label>Type</Label>
        <div style={{ fontSize: 14, color: Theme.colors.secondary, textTransform: 'capitalize' }}>
          {activeField.type}
        </div>
      </PropertyGroup>

      <PropertyGroup>
        <Label>{activeField.type === 'stamp' || activeField.type === 'signature' ? (isDesigner ? 'Placeholder (Optional)' : 'Upload Signature/Stamp') : 'Value'}</Label>
        {activeField.type === 'stamp' || activeField.type === 'signature' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeField.value && (
              <img 
                src={activeField.value} 
                alt="Stamp/Signature" 
                style={{ width: '100%', height: 'auto', borderRadius: 4, border: `1px solid ${Theme.colors.border}` }} 
              />
            )}
            <UIButton as="label" style={{ fontSize: 12, textAlign: 'center' }}>
              {activeField.value ? 'Re-upload' : 'Upload Image'}
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleStampUpload} 
              />
            </UIButton>
          </div>
        ) : (
          <Input 
            value={activeField.value || ''} 
            onChange={(e) => updateField(activeField.id, { value: e.target.value })}
            placeholder={activeField.type === 'date' ? 'YYYY-MM-DD' : 'Enter text...'}
          />
        )}
      </PropertyGroup>

      {isDesigner && (
        <>
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
        </>
      )}
    </InspectorContainer>
  );
};
