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
        (field.type === 'signature' || field.type === 'stamp') &&
        field.value
      ) {
        try {
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
          console.error(`Failed to embed ${field.type} image:`, e);
        }
      } else if (
        field.value &&
        (field.type === 'text' || field.type === 'date')
      ) {
        page.drawText(field.value, {
          x,
          y: y + (field.height * height) / 2 - 6,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }

    return await pdfDoc.save();
  }
}
