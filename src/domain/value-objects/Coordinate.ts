export interface Dimensions {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export class NormalizedCoordinate {
  constructor(public readonly x: number, public readonly y: number) {
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      throw new Error('Coordinates must be between 0 and 1');
    }
  }

  toCanvas(canvas: Dimensions): Point {
    return {
      x: this.x * canvas.width,
      y: this.y * canvas.height,
    };
  }

  static fromCanvas(point: Point, canvas: Dimensions): NormalizedCoordinate {
    return new NormalizedCoordinate(
      point.x / canvas.width,
      point.y / canvas.height
    );
  }
}
