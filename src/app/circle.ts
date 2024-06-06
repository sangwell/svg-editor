import {Shape, ShapeType} from "./svg-shape";
import {SvgStyleTransfer} from "./svg";

export class SVGCircle {
  source: any;

  constructor(source: any) {
    this.source = source;
    // console.log('source===', source.getAttribute('stroke'));
    // console.log('source===', source.getAttribute('fill'));
  }

  update(styleTransfer: SvgStyleTransfer) {
    this.source.setAttribute(styleTransfer.attribute, styleTransfer.newValue);
    this.source.style[styleTransfer.attribute] = styleTransfer.newValue;
  }
}

// todo
export class Circle extends Shape {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;

  constructor(cx: number, cy: number, r: number, fill: string, stroke: string) {
    super(ShapeType.CIRCLE);
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.fill = fill;
    this.stroke = stroke;
  }

  render(): SVGCircleElement {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.cx.toString());
    circle.setAttribute("cy", this.cy.toString());
    circle.setAttribute("r", this.r.toString());
    circle.setAttribute("fill", this.fill);
    circle.setAttribute("id", this.id);
    return circle;
  }

  static create(cx: number, cy: number, r: number, fill: string, stroke: string) {
    return new Circle(cx, cy, r, fill, stroke);
  }
}
