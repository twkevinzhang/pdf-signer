import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Canvas, Rect, FabricImage, IText } from 'fabric';
import { Theme } from '../../styles/DesignSystem';
import { useDocument } from '../../application/DocumentStore';
import { NormalizedCoordinate } from '../../domain/value-objects/Coordinate';
import { Field } from '../../domain/entities/Field';

interface PDFPageProps {
  page: pdfjs.PDFPageProxy;
  scale?: number;
}

export const PDFPage: React.FC<PDFPageProps> = ({ page, scale = 1.2 }) => {
  const { fields, updateField, setActiveField, appMode } = useDocument();
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const renderTaskRef = useRef<any>(null);

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

  const createFabricObject = (field: Field, canvasWidth: number, canvasHeight: number, onComplete: (obj: any) => void) => {
    const isSignature = field.type === 'signature';
    const isSigner = appMode === 'signer';
    
    const commonProps = {
      left: field.x * canvasWidth,
      top: field.y * canvasHeight,
      data: { id: field.id },
      hasControls: !isSigner,
      lockMovementX: isSigner,
      lockMovementY: isSigner,
      hasRotatingPoint: false,
      hoverCursor: isSigner ? 'pointer' : 'move',
    };

    if (isSignature && field.value) {
      FabricImage.fromURL(field.value).then((img: any) => {
        img.set({
          ...commonProps,
          scaleX: (field.width * canvasWidth) / img.width!,
          scaleY: (field.height * canvasHeight) / img.height!,
        });
        onComplete(img);
      });
      return;
    }

    if ((field.type === 'text' || field.type === 'date') && field.value) {
      const text = new IText(field.value, {
        ...commonProps,
        fontSize: 14,
        fontFamily: 'Helvetica',
        fill: '#000',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      });
      onComplete(text);
      return;
    }

    const rect = new Rect({
      ...commonProps,
      width: field.width * canvasWidth,
      height: field.height * canvasHeight,
      fill: isSignature ? 'rgba(0, 113, 227, 0.15)' : 'rgba(255, 255, 255, 0.8)',
      stroke: isSignature ? Theme.colors.primary : Theme.colors.border,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });
    
    onComplete(rect);
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
      
      const isSignature = field.type === 'signature';
      const isText = field.type === 'text' || field.type === 'date';
      const hasValue = !!field.value;
      
      let needsRecreation = false;
      if (existing) {
        if (isSignature) {
          needsRecreation = hasValue !== existing.isType('image');
        } else if (isText) {
          needsRecreation = hasValue !== existing.isType('i-text');
        }
      }

      if (!existing || needsRecreation) {
        if (needsRecreation) canvas.remove(existing!);
        createFabricObject(field, canvas.width!, canvas.height!, (obj) => {
          canvas.add(obj);
          canvas.renderAll();
        });
      } else {
        const isActive = canvas.getActiveObject() === existing;
        if (!isActive) {
          existing.set({
            left: field.x * canvas.width!,
            top: field.y * canvas.height!,
          });
          
          if (existing.isType('image')) {
            existing.set({
              scaleX: (field.width * canvas.width!) / existing.width!,
              scaleY: (field.height * canvas.height!) / existing.height!,
            });
          } else if (existing.isType('i-text')) {
            (existing as IText).set({ text: field.value || '' });
          } else {
            existing.set({
              width: (field.width * canvas.width!) / (existing.scaleX || 1),
              height: (field.height * canvas.height!) / (existing.scaleY || 1),
            });
          }
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

    const handleSelection = (e: any) => {
      const target = e.selected?.[0];
      if (target) setActiveField(target.get('data')?.id || null);
    };

    canvas.on('object:modified', (e: any) => e.target && syncFieldToDomain(e.target));
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setActiveField(null));
    
    fabricRef.current = canvas;
    syncFieldsToFabric();
  };

  const renderPdfAndInit = async () => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderTask = page.render({ 
      canvasContext: canvas.getContext('2d')!, 
      viewport,
      canvas 
    });
    
    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
      initializeFabric(viewport.width, viewport.height);
    } catch (error: any) {
      if (error.name !== 'RenderingCancelledException') {
        console.error('PDF rendering error:', error);
      }
    }
  };

  useEffect(() => {
    renderPdfAndInit();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
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
