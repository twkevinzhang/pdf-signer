import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Canvas, Rect, TEvent } from 'fabric';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { NormalizedCoordinate } from '../../domain/value-objects/Coordinate';
import { Field } from '../../domain/entities/Field';

interface PDFPageProps {
  page: pdfjs.PDFPageProxy;
  scale?: number;
}

export const PDFPage: React.FC<PDFPageProps> = ({ page, scale = 1.2 }) => {
  const { fields, updateField, setActiveField } = useDocument();
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const syncFieldToDomain = (obj: any) => {
    const canvas = fabricRef.current;
    if (!canvas || !obj.get('data')?.id) return;

    const coordinate = NormalizedCoordinate.fromCanvas(
      { x: obj.left!, y: obj.top! },
      { width: canvas.width!, height: canvas.height! }
    );

    updateField(obj.get('data').id, {
      x: coordinate.x,
      y: coordinate.y,
      width: (obj.width! * obj.scaleX!) / canvas.width!,
      height: (obj.height! * obj.scaleY!) / canvas.height!,
    });
  };

  const createFabricObject = (field: Field, canvasWidth: number, canvasHeight: number) => {
    const isSignature = field.type === 'signature';
    return new Rect({
      left: field.x * canvasWidth,
      top: field.y * canvasHeight,
      width: field.width * canvasWidth,
      height: field.height * canvasHeight,
      fill: isSignature ? 'rgba(0, 113, 227, 0.15)' : 'rgba(255, 255, 255, 0.8)',
      stroke: isSignature ? Theme.colors.primary : Theme.colors.border,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      data: { id: field.id },
    });
  };

  const syncFieldsToFabric = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const pageFields = fields.filter(f => f.page === page.pageNumber);
    const existingObjects = canvas.getObjects();

    existingObjects.forEach((obj: any) => {
      const data = obj.get('data');
      if (data?.id && !pageFields.find(f => f.id === data.id)) {
        canvas.remove(obj);
      }
    });

    pageFields.forEach(field => {
      const existing = existingObjects.find((obj: any) => obj.get('data')?.id === field.id);
      if (!existing) {
        canvas.add(createFabricObject(field, canvas.width!, canvas.height!));
      } else {
        if (!canvas.getActiveObject() || canvas.getActiveObject() !== existing) {
          existing.set({
            left: field.x * canvas.width!,
            top: field.y * canvas.height!,
            width: (field.width * canvas.width!) / (existing.scaleX || 1),
            height: (field.height * canvas.height!) / (existing.scaleY || 1),
          });
          existing.setCoords();
        }
      }
    });

    canvas.renderAll();
  };

  const initializeFabric = (width: number, height: number) => {
    if (fabricRef.current) fabricRef.current.dispose();
    
    const canvas = new Canvas(`page-${page.pageNumber}`, {
      width,
      height,
      selectionColor: 'rgba(0, 113, 227, 0.1)',
      selectionBorderColor: Theme.colors.primary,
    });

    canvas.on('object:modified', (e: any) => e.target && syncFieldToDomain(e.target));
    canvas.on('selection:created', (e: any) => {
      const target = e.selected?.[0];
      if (target) setActiveField(target.get('data')?.id || null);
    });
    canvas.on('selection:cleared', () => setActiveField(null));
    
    fabricRef.current = canvas;
    syncFieldsToFabric();
  };

  const renderPdfAndInit = async () => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ 
      canvasContext: canvas.getContext('2d')!, 
      viewport,
      canvas 
    }).promise;
    
    initializeFabric(viewport.width, viewport.height);
  };

  useEffect(() => {
    renderPdfAndInit();
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
    };
  }, [page, scale]);

  useEffect(() => {
    syncFieldsToFabric();
  }, [fields]);

  return (
    <div style={{ position: 'relative', marginBottom: 40, boxShadow: Theme.shadows.medium, borderRadius: Theme.radius.medium, overflow: 'hidden' }}>
      <canvas ref={pdfCanvasRef} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <canvas id={`page-${page.pageNumber}`} />
      </div>
    </div>
  );
};
