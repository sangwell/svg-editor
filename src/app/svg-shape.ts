export enum ShapeType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  ELLIPSE = 'ellipse',
  POLYLINE = 'polyline',
  POLYGON = 'polygon',
  PATH = 'path',
  TEXT = 'text'
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export abstract class Shape {
  id: string;
  type: ShapeType;

  protected constructor(type: ShapeType) {
    this.id = guid();
    this.type = type;
  }

  abstract render(): SVGElement;
}
