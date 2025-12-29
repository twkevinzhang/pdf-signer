import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Field } from '../domain/entities/Field';
import * as pdfjs from 'pdfjs-dist';

interface DocumentState {
  file: File | null;
  pdfDocument: pdfjs.PDFDocumentProxy | null;
  fields: Field[];
  activeFieldId: string | null;
}

interface DocumentContextType extends DocumentState {
  setFile: (file: File) => Promise<void>;
  addField: (field: Field) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  removeField: (id: string) => void;
  setActiveField: (id: string | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DocumentState>({
    file: null,
    pdfDocument: null,
    fields: [],
    activeFieldId: null,
  });

  const setFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    setState(prev => ({ ...prev, file, pdfDocument, fields: [] }));
  };

  const addField = (field: Field) => {
    setState(prev => ({ ...prev, fields: [...prev.fields, field], activeFieldId: field.id }));
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setState(prev => ({
      ...prev,
      fields: prev.fields.map(f => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const removeField = (id: string) => {
    setState(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id),
      activeFieldId: prev.activeFieldId === id ? null : prev.activeFieldId,
    }));
  };

  const setActiveField = (activeFieldId: string | null) => {
    setState(prev => ({ ...prev, activeFieldId }));
  };

  return (
    <DocumentContext.Provider value={{ ...state, setFile, addField, updateField, removeField, setActiveField }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocument must be used within a DocumentProvider');
  return context;
};
