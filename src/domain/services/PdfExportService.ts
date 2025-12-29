import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Field } from '../entities/Field';

export class PdfExportService {
  static async export(
    originalFile: File,
    fields: Field[]
  ): Promise<Uint8Array> {
    const arrayBuffer = await originalFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const field of fields) {
      const pageIndex = field.page - 1;
      if (pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      // Convert normalized coordinates back to points
      const x = field.x * width;
      const y = (1 - field.y) * height - field.height * height; // PDF coordinates are from bottom-left

      if (
        field.type === 'signature' ||
        (field.type === 'stamp' && !field.value)
      ) {
        page.drawRectangle({
          x,
          y,
          width: field.width * width,
          height: field.height * height,
          borderColor: rgb(0, 0.44, 0.89),
          borderWidth: 1,
          color: rgb(0.9, 0.95, 1),
        });
        page.drawText(
          field.type === 'signature'
            ? 'Signature Placeholder'
            : 'Stamp Placeholder',
          {
            x: x + 5,
            y: y + 5,
            size: 10,
            font,
            color: rgb(0, 0.44, 0.89),
          }
        );
      } else if (field.type === 'stamp' && field.value) {
        try {
          // Embed image (handles both PNG and JPG)
          const imageBytes = Uint8Array.from(
            atob(field.value.split(',')[1]),
            (c) => c.charCodeAt(0)
          );
          const image = field.value.includes('image/png')
            ? await pdfDoc.embedPng(imageBytes)
            : await pdfDoc.embedJpg(imageBytes);

          page.drawImage(image, {
            x,
            y,
            width: field.width * width,
            height: field.height * height,
          });
        } catch (e) {
          console.error('Failed to embed stamp image:', e);
        }
      } else if (field.type === 'text' || field.type === 'date') {
        page.drawText(field.value || '', {
          x,
          y: y + (field.height * height) / 2 - 6, // Vertically center text approximately
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }

    return await pdfDoc.save();
  }
}
