import React, { useEffect, useState } from 'react';
import { DocumentProvider, useDocument } from './application/DocumentStore';
import { MainLayout, Sidebar, CanvasArea, Theme } from './styles/DesignSystem';
import { DesignerToolbar } from './components/Designer/Toolbar';
import { PDFPage } from './components/Designer/PDFPage';
import { FileUp, Layers } from 'lucide-react';
import styled from 'styled-components';

const UploadPlaceholder = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px;
  border: 2px dashed ${Theme.colors.border};
  border-radius: ${Theme.radius.large};
  cursor: pointer;
  transition: all 0.3s;
  color: ${Theme.colors.secondary};

  &:hover {
    border-color: ${Theme.colors.primary};
    background: rgba(0, 113, 227, 0.02);
  }
`;

const SignatureApp: React.FC = () => {
  const { pdfDocument, setFile } = useDocument();
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    const loadPages = async () => {
      if (!pdfDocument) return;
      const loadedPages = [];
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        loadedPages.push(await pdfDocument.getPage(i));
      }
      setPages(loadedPages);
    };
    loadPages();
  }, [pdfDocument]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFile(file);
  };

  return (
    <MainLayout>
      <Sidebar>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, color: '#1d1d1f' }}>
          PDF Signer
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: Theme.colors.secondary, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <Layers size={14} /> Pages
        </div>
        {/* 這裡未來可以放頁面縮圖 */}
      </Sidebar>

      <CanvasArea>
        {!pdfDocument ? (
          <UploadPlaceholder>
            <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
            <FileUp size={48} color={Theme.colors.primary} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>Upload PDF Contract</div>
              <div style={{ fontSize: 14 }}>Drag and drop or click to browse</div>
            </div>
          </UploadPlaceholder>
        ) : (
          <>
            <DesignerToolbar />
            <div style={{ width: '100%', maxWidth: 1000 }}>
              {pages.map((page, index) => (
                <PDFPage key={index} page={page} />
              ))}
            </div>
          </>
        )}
      </CanvasArea>
    </MainLayout>
  );
};

export default function App() {
  return (
    <DocumentProvider>
      <SignatureApp />
    </DocumentProvider>
  );
}
