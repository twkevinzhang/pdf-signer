import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import * as fabric from 'fabric';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { NormalizedCoordinate } from '../../domain/value-objects/Coordinate';

interface PDFPageProps {
  page: pdfjs.PDFPageProxy;
  scale?: number;
}

export const PDFPage: React.FC<PDFPageProps> = ({ page, scale = 1.2 }) => {
  const { fields, updateField, setActiveField } = useDocument();
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null); // 先用 any 避開 namespace 報錯

  const syncFieldToDomain = (obj: any) => {
    const canvas = fabricRef.current;
    if (!canvas || !obj.data?.id) return;

    const coordinate = NormalizedCoordinate.fromCanvas(
      { x: obj.left!, y: obj.top! },
      { width: canvas.width!, height: canvas.height! }
    );

    updateField(obj.data.id, {
      x: coordinate.x,
      y: coordinate.y,
      width: obj.getScaledWidth() / canvas.width!,
      height: obj.getScaledHeight() / canvas.height!,
    });
  };

  const initializeFabric = (width: number, height: number) => {
    if (fabricRef.current) fabricRef.current.dispose();
    
    // @ts-ignore
    const canvas = new fabric.fabric.Canvas(`page-${page.pageNumber}`, {
      width,
      height,
      selectionColor: 'rgba(0, 113, 227, 0.1)',
      selectionBorderColor: Theme.colors.primary,
    });

    canvas.on('object:modified', (e: any) => e.target && syncFieldToDomain(e.target));
    canvas.on('selection:created', (e: any) => {
      const target = e.selected?.[0];
      if (target) setActiveField(target.data?.id || null);
    });
    canvas.on('selection:cleared', () => setActiveField(null));
    
    fabricRef.current = canvas;
    return canvas;
  };

  const renderPdfAndFields = async () => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ 
      canvasContext: canvas.getContext('2d')!, 
      viewport,
      canvas: canvas 
    }).promise;
    
    initializeFabric(viewport.width, viewport.height);
  };

  useEffect(() => {
    renderPdfAndFields();
    return () => fabricRef.current?.dispose();
  }, [page, scale]);

  return (
    <div style={{ position: 'relative', marginBottom: 40, boxShadow: Theme.shadows.medium, borderRadius: Theme.radius.medium, overflow: 'hidden' }}>
      <canvas ref={pdfCanvasRef} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <canvas id={`page-${page.pageNumber}`} />
      </div>
    </div>
  );
};
