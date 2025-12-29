import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import * as fabric from 'fabric';
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
  const fabricRef = useRef<any>(null);

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
      width: (obj.width! * obj.scaleX!) / canvas.width!,
      height: (obj.height! * obj.scaleY!) / canvas.height!,
    });
  };

  const createFabricObject = (field: Field, canvasWidth: number, canvasHeight: number) => {
    const isSignature = field.type === 'signature';
    const rect = new fabric.fabric.Rect({
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
      hasRotatingPoint: false,
    });
    
    return rect;
  };

  const syncFieldsToFabric = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const pageFields = fields.filter(f => f.page === page.pageNumber);
    const existingObjects = canvas.getObjects();

    // Remove objects that are no longer in state
    existingObjects.forEach((obj: any) => {
      if (obj.data?.id && !pageFields.find(f => f.id === obj.data.id)) {
        canvas.remove(obj);
      }
    });

    // Add or Update objects
    pageFields.forEach(field => {
      const existing = existingObjects.find((obj: any) => obj.data?.id === field.id);
      if (!existing) {
        canvas.add(createFabricObject(field, canvas.width!, canvas.height!));
      } else {
        // Update position if not currently being dragged by user
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
    
    // @ts-ignore
    const canvas = new fabric.fabric.Canvas(`page-${page.pageNumber}`, {
      width,
      height,
      selectionColor: 'rgba(0, 113, 227, 0.1)',
      selectionBorderColor: Theme.colors.primary,
    });

    canvas.on('object:modified', (e: any) => e.target && syncFieldToDomain(e.target));
    canvas.on('selection:created', (e: any) => setActiveField(e.selected?.[0]?.data?.id || null));
    canvas.on('selection:cleared', () => setActiveField(null));
    
    fabricRef.current = canvas;
    syncFieldsToFabric();
  };

  const renderPdf = async () => {
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
    renderPdf();
    return () => fabricRef.current?.dispose();
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
