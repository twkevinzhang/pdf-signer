import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Layers } from 'lucide-react';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';

const SidebarContainer = styled.aside`
  width: 240px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid ${Theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  overflow-y: auto;
`;

const SidebarTitle = styled.div`
  padding: 0 24px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1d1d1f;
`;

const SectionHeader = styled.div`
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${Theme.colors.secondary};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 16px;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 24px;
`;

const ThumbnailItem = styled.div<{ active?: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1.4;
  background: #fff;
  border-radius: ${Theme.radius.small};
  border: 2px solid ${props => props.active ? Theme.colors.primary : Theme.colors.border};
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    border-color: ${Theme.colors.primary};
  }
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  color: ${Theme.colors.secondary};
  background: rgba(255,255,255,0.8);
  padding: 2px 6px;
  border-radius: 4px;
`;

export const Sidebar: React.FC = () => {
  const { pdfDocument } = useDocument();
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    const generateThumbnails = async () => {
      if (!pdfDocument) return;
      
      const newThumbnails = [];
      for (let i = 1; i <= Math.min(pdfDocument.numPages, 10); i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ 
          canvasContext: canvas.getContext('2d')!, 
          viewport,
          canvas: canvas
        }).promise;
        newThumbnails.push(canvas.toDataURL());
      }
      setThumbnails(newThumbnails);
    };

    generateThumbnails();
  }, [pdfDocument]);

  return (
    <SidebarContainer>
      <SidebarTitle>PDF Signer</SidebarTitle>
      
      <SectionHeader>
        <Layers size={14} /> Pages
      </SectionHeader>

      <ThumbnailContainer>
        {thumbnails.map((url, i) => (
          <ThumbnailItem key={i} active={i === 0}>
            <img src={url} alt={`Page ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <PageNumber>{i + 1}</PageNumber>
          </ThumbnailItem>
        ))}
        {pdfDocument && pdfDocument.numPages > 10 && (
          <div style={{ fontSize: 12, color: Theme.colors.secondary, textAlign: 'center' }}>
            + {pdfDocument.numPages - 10} more pages
          </div>
        )}
      </ThumbnailContainer>
    </SidebarContainer>
  );
};
