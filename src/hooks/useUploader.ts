import React, { createRef, useState } from 'react';
import { readAsDataURL, readAsImage, readAsPDF } from '../utils/asyncReader';
import { Pdf } from './usePdf';
import { AttachmentTypes } from '../entities';
import { v4 as uuidv4 } from 'uuid';

export enum UploadTypes {
  PDF = 'pdf',
  IMAGE = 'image',
}

export const useUploader = ({
  afterUploadPdf,
  afterUploadImage,
  use,
}: {
  afterUploadPdf?: (upload: Pdf) => void;
  afterUploadImage?: (upload: ImageAttachment) => void;
  use: UploadTypes;
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = createRef<HTMLInputElement>();

  return {
    inputRef,
    uploading,
    handleUpload: () => {
      const input = inputRef.current;
      if (input) {
        input.value = '';
        setUploading(true);
        input.click();
      }
    },
    fileOnChange: async (
      event: React.ChangeEvent<HTMLInputElement> & {
        dataTransfer?: DataTransfer;
      }
    ) => {
      if (!uploading) return;

      const files: FileList | undefined =
        event.currentTarget.files ||
        (event.dataTransfer && event.dataTransfer.files);
      if (!files) {
        setUploading(false);
        return;
      }

      const file = files[0];
      if (use === UploadTypes.IMAGE) {
        const result = await fileToImage(file);
        if (afterUploadImage) afterUploadImage(result);
      } else if (use === UploadTypes.PDF) {
        const result = await fileToPdf(file);
        if (afterUploadPdf) afterUploadPdf(result);
      }

      setUploading(false);
    },
  };
};

export async function fileToImage(file: File, id: string = uuidv4()): Promise<ImageAttachment> {
  try {
    const url = await readAsDataURL(file);
    const img = await readAsImage(url as string);
    const { width, height } = img;

    return {
      id,
      type: AttachmentTypes.IMAGE,
      width,
      height,
      x: 0,
      y: 0,
      img,
      file,
    } as ImageAttachment;
  } catch (error) {
    console.log('Failed to load image', error);
    throw new Error('Failed to load image');
  }
}

export async function fileToPdf(file: File): Promise<Pdf> {
  try {
    const pdf = await readAsPDF(file);
    return {
      file,
      name: file.name,
      pages: Array(pdf.numPages)
        .fill(0)
        .map((_, index) => pdf.getPage(index + 1)),
    } as Pdf;
  } catch (error) {
    console.log('Failed to load pdf', error);
    throw new Error('Failed to load PDF');
  }
}
