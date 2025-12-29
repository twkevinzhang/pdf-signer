import { v4 as uuidv4 } from 'uuid';

export type FieldType = 'signature' | 'text' | 'date' | 'stamp';

export interface Field {
  id: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  required: boolean;
}

export class FieldFactory {
  static create(type: FieldType, page: number, x: number, y: number): Field {
    return {
      id: uuidv4(),
      type,
      page,
      x,
      y,
      width: 0.2, // Default 20% width
      height: 0.05, // Default 5% height
      required: true,
    };
  }
}
