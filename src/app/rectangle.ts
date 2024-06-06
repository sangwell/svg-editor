import {ShapeType, Shape} from "./svg-shape";

export class Rectangle extends Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;

  constructor(x: number, y: number, width: number, height: number, fill: string, stroke: string) {
    super(ShapeType.RECTANGLE);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fill = fill;
    this.stroke = stroke;
  }

  render(): SVGRectElement {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", this.x.toString());
    rect.setAttribute("y", this.y.toString());
    rect.setAttribute("width", this.width.toString());
    rect.setAttribute("height", this.height.toString());
    rect.setAttribute("fill", this.fill);
    rect.setAttribute("stroke", this.stroke);
    rect.setAttribute("id", this.id);
    return rect;
  }

  static create(x: number, y: number, width: number, height: number, fill: string, stroke: string) {
    return new Rectangle(x, y, width, height, fill, stroke);
  }
}
