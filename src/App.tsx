import React, { useEffect, useState } from 'react';
import { DocumentProvider, useDocument } from './application/DocumentStore';
import { MainLayout, CanvasArea, Theme, UIButton } from './styles/DesignSystem';
import { DesignerToolbar } from './components/Designer/Toolbar';
import { PDFPage } from './components/Designer/PDFPage';
import { Inspector } from './components/Designer/Inspector';
import { Sidebar } from './components/Designer/Sidebar';
import { FileUp, FileJson, ArrowLeft, PenTool, Layout } from 'lucide-react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 40px;
  background: #f5f5f7;
`;

const ModeCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: ${Theme.radius.large};
  box-shadow: ${Theme.shadows.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
  cursor: pointer;
  width: 300px;

  &:hover {
    transform: translateY(-5px);
  }
`;

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
  background: white;

  &:hover {
    border-color: ${Theme.colors.primary};
    background: rgba(0, 113, 227, 0.02);
  }
`;

const BackButton = styled.button`
  position: fixed;
  top: 24px;
  left: 24px;
  background: white;
  border: 1px solid ${Theme.colors.border};
  padding: 8px 16px;
  border-radius: ${Theme.radius.medium};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 1100;
  font-weight: 600;

  &:hover {
    background: #f5f5f7;
  }
`;

const SignatureApp: React.FC = () => {
  const { pdfDocument, setFile, appMode, setAppMode, loadConfig } = useDocument();
  const [pages, setPages] = useState<any[]>([]);
  const [hasJson, setHasJson] = useState(false);

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

  const handleJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      loadConfig(text);
      setHasJson(true);
    }
  };

  if (!appMode) {
    return (
      <HomeContainer>
        <h1 style={{ fontSize: '48px', fontWeight: 800 }}>PDF Signer</h1>
        <div style={{ display: 'flex', gap: '24px' }}>
          <ModeCard onClick={() => setAppMode('designer')}>
            <Layout size={64} color={Theme.colors.primary} />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Designer</h2>
              <p style={{ color: Theme.colors.secondary }}>Create signing fields and layouts</p>
            </div>
          </ModeCard>
          <ModeCard onClick={() => setAppMode('signer')}>
            <PenTool size={64} color="#34C759" />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Signer</h2>
              <p style={{ color: Theme.colors.secondary }}>Fill and sign documents</p>
            </div>
          </ModeCard>
        </div>
      </HomeContainer>
    );
  }

  const isReady = appMode === 'designer' ? !!pdfDocument : (!!pdfDocument && hasJson);

  return (
    <MainLayout>
      <BackButton onClick={() => window.location.reload()}>
        <ArrowLeft size={18} /> Exit {appMode === 'designer' ? 'Designer' : 'Signer'}
      </BackButton>

      {!isReady ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '24px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>{appMode === 'designer' ? 'Upload PDF to Design' : 'Upload PDF & Config to Sign'}</h1>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <UploadPlaceholder>
              <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
              <FileUp size={48} color={pdfDocument ? "#34C759" : Theme.colors.primary} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>
                  {pdfDocument ? 'PDF Loaded' : '1. Upload PDF Contract'}
                </div>
                {pdfDocument && <div style={{ fontSize: 14, color: '#34C759' }}>{pdfDocument.numPages} Pages ready</div>}
              </div>
            </UploadPlaceholder>

            {appMode === 'signer' && (
              <UploadPlaceholder>
                <input type="file" hidden accept="application/json" onChange={handleJsonChange} />
                <FileJson size={48} color={hasJson ? "#34C759" : Theme.colors.primary} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>
                    {hasJson ? 'Config Loaded' : '2. Upload JSON Config'}
                  </div>
                  {hasJson && <div style={{ fontSize: 14, color: '#34C759' }}>Fields mapped successfully</div>}
                </div>
              </UploadPlaceholder>
            )}
          </div>
        </div>
      ) : (
        <>
          <Sidebar />
          <CanvasArea>
            <DesignerToolbar />
            <div style={{ width: '100%', maxWidth: 1000 }}>
              {pages.map((page, index) => (
                <PDFPage key={index} page={page} />
              ))}
            </div>
          </CanvasArea>
          <Inspector />
        </>
      )}
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
