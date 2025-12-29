import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Field } from '../domain/entities/Field';
import * as pdfjs from 'pdfjs-dist';

// Set PDF.js worker from CDN to avoid environment issues in Vite
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentState {
  file: File | null;
  pdfDocument: pdfjs.PDFDocumentProxy | null;
  fields: Field[];
  activeFieldId: string | null;
  appMode: 'designer' | 'signer' | null;
}

interface DocumentContextType extends DocumentState {
  setFile: (file: File) => Promise<void>;
  setAppMode: (mode: 'designer' | 'signer' | null) => void;
  loadConfig: (json: string) => void;
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
    appMode: null,
  });

  const setFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    setState(prev => ({ ...prev, file, pdfDocument }));
  };

  const setAppMode = (appMode: 'designer' | 'signer' | null) => {
    setState(prev => ({ ...prev, appMode }));
  };

  const loadConfig = (json: string) => {
    try {
      const config = JSON.parse(json);
      if (config.fields) {
        setState(prev => ({ ...prev, fields: config.fields }));
      }
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
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
    <DocumentContext.Provider value={{ ...state, setFile, setAppMode, loadConfig, addField, updateField, removeField, setActiveField }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) throw new Error('useDocument must be used within a DocumentProvider');
  return context;
};
