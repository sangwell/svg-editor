import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs';
import {buffer, map, throttleTime} from 'rxjs/operators';
import {Image} from '../image';
import {SvgItem, SvgPoint, SvgStyleTransfer} from '../svg';
import {DomSanitizer} from '@angular/platform-browser';
import {SVGCircle} from "../circle";

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: '[app-canvas]',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, OnChanges, AfterViewInit {
  get canvasWidth(): number {
    return this._canvasWidth;
  }

  set canvasWidth(canvasWidth: number) {
    this._canvasWidth = canvasWidth;
    this.canvasWidthChange.emit(this._canvasWidth);
  }

  get canvasHeight(): number {
    return this._canvasHeight;
  }

  set canvasHeight(canvasHeight: number) {
    this._canvasHeight = canvasHeight;
    this.canvasHeightChange.emit(this._canvasHeight);
  }

  get draggedPoint(): SvgPoint | null {
    return this._draggedPoint;
  }

  @Input() set draggedPoint(draggedPoint: SvgPoint | null) {
    this._draggedPoint = draggedPoint;
    this.draggedPointChange.emit(this.draggedPoint);
  }

  get focusedItem(): SvgItem | null {
    return this._focusedItem;
  }

  @Input() set focusedItem(focusedItem: SvgItem | null) {
    this._focusedItem = focusedItem;
    this.focusedItemChange.emit(this.focusedItem);
  }

  get hoveredItem(): SvgItem | null {
    return this._hoveredItem;
  }

  @Input() set hoveredItem(hoveredItem: SvgItem | null) {
    this._hoveredItem = hoveredItem;
    this.hoveredItemChange.emit(this.hoveredItem);
  }

  get wasCanvasDragged(): boolean {
    return this._wasCanvasDragged;
  }

  @Input() set wasCanvasDragged(wasCanvasDragged: boolean) {
    this._wasCanvasDragged = wasCanvasDragged;
    this.wasCanvasDraggedChange.emit(this._wasCanvasDragged);
  }

  get focusedImage(): Image | null {
    return this._focusedImage;
  }

  @Input() set focusedImage(focusedImage: Image | null) {
    this._focusedImage = focusedImage;
    this.focusedImageChange.emit(this.focusedImage);
  }

  constructor(public canvas: ElementRef,
              private domSanitizer: DomSanitizer) {
  }

  svgTest: any;

  selectionRect: any;

  @Input() svg?: any;
  @Input() selectedElementKey?: string;
  @Input() hiddenElementKey?: string;
  @Input() showElementKey?: string;
  @Input() toggleKey?: any;
  @Input() viewPortX: number = 0;
  @Input() viewPortY: number = 0;
  @Input() viewPortWidth: number = 0;
  @Input() viewPortHeight: number = 0;
  @Input() strokeWidth: number = 1;
  @Input() showTicks: boolean = false;
  @Input() tickInterval: number = 1;
  @Input() styleTransfer?: SvgStyleTransfer;
  @Output() afterSvgChange = new EventEmitter<void>();
  @Output() dragging = new EventEmitter<boolean>();
  @Output() viewPort = new EventEmitter<{ x: number, y: number, w: number, h: number | null, force?: boolean }>();

  _canvasWidth: number = 0;
  @Output() canvasWidthChange = new EventEmitter<number>();

  _canvasHeight: number = 0;
  @Output() canvasHeightChange = new EventEmitter<number>();

  _draggedPoint: SvgPoint | null = null;
  @Output() draggedPointChange = new EventEmitter<SvgPoint | null>();

  _focusedItem: SvgItem | null = null;
  @Output() focusedItemChange = new EventEmitter<SvgItem | null>();

  _hoveredItem: SvgItem | null = null;
  @Output() hoveredItemChange = new EventEmitter<SvgItem | null>();

  _wasCanvasDragged = false;
  @Output() wasCanvasDraggedChange = new EventEmitter<boolean>();

  _focusedImage: Image | null = null;
  @Output() focusedImageChange = new EventEmitter<Image | null>();

  _selectedElement: any | null = null;
  @Output() selectedElementChange = new EventEmitter<Image | null>();

  draggedEvt: MouseEvent | TouchEvent | null = null;
  wheel$ = new Subject<WheelEvent>();
  dragWithoutClick = true;
  draggedImage: Image | null = null;
  draggedImageType: number = 0;
  xGrid: number[] = [];
  yGrid: number[] = [];

  svgTemplate: any;
  selectBorderPath: any;
  selectedItem: any;
  selectBorderPaths: any[] = [];
  editingShape: any;

  @ViewChild('svgOuterEle') svgOuterEle: any;

  min = Math.min;
  abs = Math.abs;
  trackByIndex = (idx: number, _: any) => idx;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['svg'] && changes['svg'].currentValue) {
      this.svgTemplate = this.domSanitizer.bypassSecurityTrustHtml(changes['svg'].currentValue.outerHTML);
      setTimeout(() => {
        this.afterSvgChange.emit(this.svgOuterEle.nativeElement.innerHTML);
        this.svgOuterEle.nativeElement.children[0].addEventListener('click', (event: any) => {
          this.addSelectionRect(event.target);
          this.selectedElementChange.emit(event.target);
        });
      }, 0);
    }
    if (changes['viewPortX'] || changes['viewPortY'] || changes['viewPortWidth'] || changes['viewPortHeight']) {
      this.refreshGrid();
    }
    if (changes['selectedElementKey'] && changes['selectedElementKey'].currentValue) {
      this.selectedItem = this.findSvgItemByKey(this.svgOuterEle.nativeElement.children[0], changes['selectedElementKey'].currentValue);
      this.addSelectionRect(this.selectedItem);
      /*if (this.selectedItem.tagName === 'circle') {
        this.editingShape = new SVGCircle(this.selectedItem);
      }*/
    }
    if (changes['toggleKey'] && changes['toggleKey'].currentValue) {
      const item: any = this.findSvgItemByKey(this.svgOuterEle.nativeElement.children[0], changes['toggleKey'].currentValue.key);
      item.setAttribute('visibility', changes['toggleKey'].currentValue.action);
    }
    if (changes['styleTransfer'] && changes['styleTransfer'].currentValue) {
      // this.editingShape.update(changes['styleTransfer'].currentValue);
      this.selectedItem.setAttribute(changes['styleTransfer'].currentValue.attribute, changes['styleTransfer'].currentValue.newValue);
      this.selectedItem.style[changes['styleTransfer'].currentValue.attribute] = changes['styleTransfer'].currentValue.newValue;
      this.afterSvgChange.emit(this.svgOuterEle.nativeElement.innerHTML);
    }
  }

  addSelectionRect(target: any) {
    if (this.selectionRect) {
      this.selectionRect.remove();
    }
    const bbox = target.getBBox();
    // 创建一个新的矩形元素
    this.selectionRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const strokeWidth = Number(target.getAttribute('stroke-width') || target.style.strokeWidth || 0);
    // 设置矩形的位置和大小
    this.selectionRect.setAttribute('x', (bbox.x - strokeWidth / 2).toString());
    this.selectionRect.setAttribute('y', (bbox.y - strokeWidth / 2).toString());
    this.selectionRect.setAttribute('width', bbox.width + strokeWidth);
    this.selectionRect.setAttribute('height', bbox.height + strokeWidth);
    // 设置矩形的样式
    this.selectionRect.setAttribute('stroke', '#ffffff');
    this.selectionRect.setAttribute('stroke-width', '1');
    this.selectionRect.setAttribute('stroke-dasharray', '5 5');
    this.selectionRect.setAttribute('fill', 'none');
    // 将矩形添加到g标签中
    target.parentNode.appendChild(this.selectionRect);
  }

  /*addClickEvent(nodes: any[]) {
    Array.from(nodes).forEach((item: any) => {
      if (item.tagName !== 'g' && item.tagName !== 'defs') {
        item.addEventListener('click', () => {
          this.selectedElementChange.emit(item);
          const bbox = item.getBBox();
          const strokeWidth = Number(item.getAttribute('stroke-width') || item.style.strokeWidth || 0);
          this.renderSelectBorderPaths(bbox, strokeWidth);
        })
        if (item.children && item.children.length > 0) {
          this.addClickEvent(item.children);
        }
      }
    })
  };*/

  renderSelectBorderPaths(bbox: { x: number, y: number, width: number, height: number }, strokeWidth: number) {
    this.selectBorderPaths = [
      {
        x1: bbox.x - strokeWidth / 2 - 0.5,
        y1: bbox.y - strokeWidth / 2,
        x2: bbox.x + bbox.width + strokeWidth / 2 + 0.5,
        y2: bbox.y - strokeWidth / 2
      },
      {
        x1: bbox.x + bbox.width + strokeWidth / 2,
        y1: bbox.y - strokeWidth / 2,
        x2: bbox.x + bbox.width + strokeWidth / 2,
        y2: bbox.y + bbox.height + strokeWidth / 2
      },
      {
        x1: bbox.x + bbox.width + strokeWidth / 2 + 0.5,
        y1: bbox.y + bbox.height + strokeWidth / 2,
        x2: bbox.x - strokeWidth / 2 - 0.5,
        y2: bbox.y + bbox.height + strokeWidth / 2
      },
      {
        x1: bbox.x - strokeWidth / 2,
        y1: bbox.y + bbox.height + strokeWidth / 2,
        x2: bbox.x - strokeWidth / 2,
        y2: bbox.y - strokeWidth / 2
      }
    ];
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.refreshCanvasSize(true);
    });

    window.addEventListener('resize', () => {
      this.refreshCanvasSize(true);
    });

    window.addEventListener('wheel', () => {
    });
  }

  ngOnInit(): void {
    const cap = (val: number, max: number) => val > max ? max : val < -max ? -max : val;
    const throttler = throttleTime(20, undefined, {leading: false, trailing: true});
    this.wheel$
      .pipe(buffer(this.wheel$.pipe(throttler)))
      .pipe(map(ev => ({
        event: ev[0],
        deltaY: ev.reduce((acc, cur) => acc + cap(cur.deltaY, 50), 0)
      })))
      .subscribe(this.mousewheel.bind(this));
  }

  @HostListener('mousedown', ['$event']) onMouseDown($event: MouseEvent) {
    this.startDragCanvas($event);
    $event.stopPropagation();
  }

  @HostListener('mousemove', ['$event']) onMouseMove($event: MouseEvent) {
    this.drag($event);
  }

  @HostListener('mouseup', ['$event']) onMouseUp($event: MouseEvent) {
    this.stopDrag();
  }

  @HostListener('touchstart', ['$event']) onTouchStart($event: TouchEvent) {
    this.startDragCanvas($event);
    $event.preventDefault();
    $event.stopPropagation();
  }

  @HostListener('touchmove', ['$event']) onTouchMove($event: TouchEvent) {
    this.drag($event);
  }

  @HostListener('touchend', ['$event']) onTouchEnd($event: TouchEvent) {
    this.stopDrag();
  }

  @HostListener('wheel', ['$event']) onWheel($event: WheelEvent) {
    this.wheel$.next($event);
  }

  @HostListener('click', ['$event']) onClick($event: MouseEvent) {
    this.hoveredItem = null;
  }

  findSvgItemByKey(data: any, key: string) {
    let result;
    const loop = (item: any) => {
      if (item.getAttribute('key') === key) {
        result = item;
        return result;
      }
      if (item.children && item.children.length > 0) {
        for (let i = 0; i < item.children.length; i++) {
          loop(item.children[i])
        }
      }
    }
    loop(data);
    return result;
  }


  refreshCanvasSize(emitEmptyCanvas = false) {
    const rect = this.canvas.nativeElement.parentNode.getBoundingClientRect();
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;

    this.viewPort.emit({
      x: this.viewPortX,
      y: this.viewPortY,
      w: this.viewPortWidth,
      h: null,
      force: true
    });
  }

  refreshGrid() {
    if (5 * this.viewPortWidth <= this.canvasWidth) {
      this.xGrid = Array(Math.ceil(this.viewPortWidth) + 1).fill(null).map((_, i) => Math.floor(this.viewPortX) + i);
      this.yGrid = Array(Math.ceil(this.viewPortHeight) + 1).fill(null).map((_, i) => Math.floor(this.viewPortY) + i);
    } else {
      this.xGrid = [];
      this.yGrid = [];
    }
  }

  eventToLocation(event: MouseEvent | TouchEvent, idx = 0): { x: number, y: number } {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const touch = event instanceof MouseEvent ? event : event.touches[idx];
    const x = this.viewPortX + (touch.clientX - rect.left) * this.strokeWidth;
    const y = this.viewPortY + (touch.clientY - rect.top) * this.strokeWidth;
    return {x, y};
  }

  pinchToZoom(previousEvent: MouseEvent | TouchEvent, event: MouseEvent | TouchEvent) {
    if (window.TouchEvent
      && previousEvent instanceof TouchEvent
      && event instanceof TouchEvent
      && previousEvent.touches.length >= 2
      && event.touches.length >= 2) {
      const pt = this.eventToLocation(event, 0);
      const pt2 = this.eventToLocation(event, 1);
      const oriPt = this.eventToLocation(previousEvent, 0);
      const oriPt2 = this.eventToLocation(previousEvent, 1);
      const ptm = {x: 0.5 * (pt.x + pt2.x), y: 0.5 * (pt.y + pt2.y)};
      const oriPtm = {x: 0.5 * (oriPt.x + oriPt2.x), y: 0.5 * (oriPt.y + oriPt2.y)};
      const delta = {x: oriPtm.x - ptm.x, y: oriPtm.y - ptm.y};
      const k =
        Math.sqrt((oriPt.x - oriPt2.x) * (oriPt.x - oriPt2.x) + (oriPt.y - oriPt2.y) * (oriPt.y - oriPt2.y)) /
        Math.sqrt((pt.x - pt2.x) * (pt.x - pt2.x) + (pt.y - pt2.y) * (pt.y - pt2.y));
      return {zoom: k, delta, center: ptm};
    }
    return null;
  }

  mousewheel(event: { event: WheelEvent, deltaY: number }) {
    const scale = Math.pow(1.005, event.deltaY);
    const pt = this.eventToLocation(event.event);

    this.zoomViewPort(scale, pt);
  }

  zoomViewPort(scale: number, pt?: { x: number, y: number }) {
    if (!pt) {
      pt = {x: this.viewPortX + 0.5 * this.viewPortWidth, y: this.viewPortY + 0.5 * this.viewPortHeight};
    }
    const w = scale * this.viewPortWidth;
    const h = scale * this.viewPortHeight;
    const x = this.viewPortX + ((pt.x - this.viewPortX) - scale * (pt.x - this.viewPortX));
    const y = this.viewPortY + ((pt.y - this.viewPortY) - scale * (pt.y - this.viewPortY));

    this.viewPort.emit({x, y, w, h});
  }

  /*startDrag(item: SvgPoint) {
    console.log('start drag');
    if (item !== this.draggedPoint) {
      this.dragWithoutClick = false;
    }

    this.dragging.emit(true);
    if (item.itemReference.getType().toLowerCase() === 'z') {
      return;
    }
    this.focusedItem = item.itemReference;
    this.draggedPoint = item;
  }*/

  startDragCanvas(event: MouseEvent | TouchEvent) {
    this.draggedEvt = event;
    this.wasCanvasDragged = false;
    this.dragWithoutClick = false;
  }

  /*startDragImage(event: MouseEvent | TouchEvent, im: Image, type: number): void {
    this.dragging.emit(true);
    this.draggedEvt = event;
    this.draggedImage = im;
    this.draggedImageType = type;
    this.focusedImage = im;
  }*/

  stopDrag() {
    if (this.draggedPoint && this.draggedEvt) {
      this.drag(this.draggedEvt);
    }
    this.dragging.emit(false);

    if (!this.draggedPoint && !this.wasCanvasDragged) {
      // unselect action
      this.focusedItem = null;
    }
    if (!this.draggedImage && !this.wasCanvasDragged) {
      this.focusedImage = null;
    }

    this.draggedPoint = null;
    this.draggedEvt = null;
    this.dragWithoutClick = true;

    this.draggedImage = null;
  }

  drag(event: MouseEvent | TouchEvent) {
    if (this.draggedPoint || this.draggedEvt || this.draggedImage) {

      if (!this.dragWithoutClick && event instanceof MouseEvent && event.buttons === 0) {
        this.stopDrag();
        return;
      }

      event.stopPropagation();
      const pt = this.eventToLocation(event);
      if (this.draggedImage && this.draggedEvt) {
        const oriPt = this.eventToLocation(this.draggedEvt);
        /* eslint-disable no-bitwise */
        if (this.draggedImageType & 0b0001) {
          this.draggedImage.x1 += (pt.x - oriPt.x);
        }
        if (this.draggedImageType & 0b0010) {
          this.draggedImage.y1 += (pt.y - oriPt.y);
        }
        if (this.draggedImageType & 0b0100) {
          this.draggedImage.x2 += (pt.x - oriPt.x);
        }
        if (this.draggedImageType & 0b1000) {
          this.draggedImage.y2 += (pt.y - oriPt.y);
        }
        /* eslint-enable no-bitwise */
        this.draggedEvt = event;

      } else if (this.draggedPoint) {
        /*const decimals = event.ctrlKey ? (this.decimals ? 0 : 3) : this.decimals;
        pt.x = parseFloat(pt.x.toFixed(decimals));
        pt.y = parseFloat(pt.y.toFixed(decimals));
        this.parsedPath.setLocation(this.draggedPoint, pt as Point);
        if (this.draggedIsNew) {
          const previousIdx = this.parsedPath.path.indexOf(this.draggedPoint.itemReference) - 1;
          if (previousIdx >= 0) {
            this.draggedPoint.itemReference.resetControlPoints(this.parsedPath.path[previousIdx]);
          }
        }
        this.afterModelChange.emit();
        this.draggedEvt = null;*/
      } else if (this.draggedEvt) {
        this.wasCanvasDragged = true;
        const pinchToZoom = this.pinchToZoom(this.draggedEvt, event);
        if (pinchToZoom !== null) {
          const w = pinchToZoom.zoom * this.viewPortWidth;
          const h = pinchToZoom.zoom * this.viewPortHeight;
          const x = this.viewPortX + pinchToZoom.delta.x + (pinchToZoom.center.x - this.viewPortX) * (1 - pinchToZoom.zoom);
          const y = this.viewPortY + pinchToZoom.delta.y + (pinchToZoom.center.y - this.viewPortY) * (1 - pinchToZoom.zoom);
          this.viewPort.emit({x, y, w, h});
        } else {
          const oriPt = this.eventToLocation(this.draggedEvt);
          this.viewPort.emit({
            x: this.viewPortX + (oriPt.x - pt.x), y: this.viewPortY + (oriPt.y - pt.y),
            w: this.viewPortWidth, h: this.viewPortHeight
          });
        }
        this.draggedEvt = event;
      }
    }
  }
}
