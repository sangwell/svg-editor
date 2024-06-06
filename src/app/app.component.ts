import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {
  SvgItem,
  SvgPoint,
  formatNumber,
  SvgStyleTransfer,
  RENDER_TAGS
} from './svg';
import {DomSanitizer} from '@angular/platform-browser';
import {StorageService} from './storage.service';
import {CanvasComponent} from './canvas/canvas.component';
import {Image} from './image';
import {ConfigService} from './config.service';
import {CommonUtils} from './common-utils';
import {NzModalService} from "ng-zorro-antd/modal";
import {RuntimeComponent} from "./runtime/runtime.component";
import {FormBuilder} from "@angular/forms";
import {svg1, svg2} from "./svg-assets";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  svg: any;
  selectedElementKey: string = '';
  toggleKey: any;
  nodes: any[] = [];
  selectedSvgItem: any;
  strokeColor: string = '';
  bgColor: string = '';

  // Canvas Data:
  @ViewChild(CanvasComponent) canvas?: CanvasComponent;
  @ViewChild('svgEle') svgEle: any;
  canvasWidth = 400;
  canvasHeight = 390;
  strokeWidth: number = 1;

  // Dragged & hovered elements
  draggedPoint: SvgPoint | null = null;
  focusedItem: SvgItem | null = null;
  hoveredItem: SvgItem | null = null;
  wasCanvasDragged = false;
  draggedIsNew = false;
  dragging = false;

  // Images
  images: Image[] = [];
  focusedImage: Image | null = null;

  // UI State
  isLeftPanelOpened = true;
  isContextualMenuOpened = false;
  isEditingImages = false;

  styleTransfer?: SvgStyleTransfer;

  // Utility functions:
  max = Math.max;
  trackByIndex = (idx: number, _: any) => idx;
  formatNumber = (v: number) => formatNumber(v, 4);

  newSvg: any;

  setting: any = {};

  constructor(
    // matRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    public cfg: ConfigService,
    private storage: StorageService,
    private domSanitizer: DomSanitizer,
    private modal: NzModalService,
    private fb: FormBuilder
  ) {
  }

  get decimals() {
    return this.cfg.snapToGrid ? 0 : this.cfg.decimalPrecision;
  }

  ngOnInit() {
    this.storage.clearSetting();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.zoomAuto();
      this.createSVG();
    }, 0);
  }

  createSVG() {
    /*const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg2, 'image/svg+xml');
    this.svg = svgDoc.documentElement;
    const root = {
      title: 'SVG',
      key: 'root',
      expanded: true,
      children: []
    };
    this.findSvgNodes(this.svg, root.children);
    this.nodes = [root];*/
    // 老版本，对svg标签内的不规范属性兼容性好
    const svgNS = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNS, 'svg');
    svgEl.style.position = 'absolute';
    svgEl.innerHTML = svg2;
    document.body.appendChild(svgEl);
    this.svg = svgEl.children[0];
    const root = {
      title: 'SVG',
      key: 'root',
      expanded: true,
      children: []
    };
    this.findSvgNodes(this.svg, root);
    this.nodes = [root];
    console.log(this.nodes);
    svgEl.remove();
  }

  findSvgNodes(svg: any, nodeList: any) {
    if (svg.children && Array.from(svg.children).length > 0) {
      Array.from(svg.children).forEach((node: any, index: number) => {
        const key = CommonUtils.guid();
        node.setAttribute('key', key);
        const childNode = {
          title: node.nodeName,
          key: key,
          obj: node,
          expanded: true,
          disabled: this.setDisabled(node),
          children: []
        };
        nodeList.children.push(childNode);
        nodeList.isLeaf = nodeList.children.length === 0
        this.findSvgNodes(node, childNode);
      });
    } else {
      nodeList.isLeaf = true;
    }
  }

  setDisabled(node: any) {
    return !RENDER_TAGS.includes(node.tagName);
  }

  nzClick(node: NzTreeNodeOptions): void {
    this.setting = {};
    if (node['origin']) {
      const svgItem = node?.['origin']['obj'];
      this.selectedElementKey = node?.['origin']['key'];
      const bgColor = svgItem.getAttribute('fill') || svgItem.style.fill;
      this.bgColor = bgColor;
      const strokeColor = svgItem.getAttribute('stroke') || svgItem.style.stroke;
      this.strokeColor = strokeColor;
    }
  }

  hiddenItem(node: any) {
    node.origin.hidden = true;
    this.toggleKey = {action: 'hidden', key: node.origin.key};
  }

  showItem(node: any) {
    node.origin.hidden = false;
    this.toggleKey = {action: 'visible', key: node.origin.key};
  }

  selectElement(element: any) {
    this.setting = {};
    this.selectedElementKey = element.getAttribute('key');
    const bgColor = element.getAttribute('fill') || element.style.fill;
    this.bgColor = bgColor;
    const strokeColor = element.getAttribute('stroke') || element.style.stroke;
    this.strokeColor = strokeColor;
  }

  strokeColorChanged(color: string) {
    this.styleTransfer = {
      key: this.selectedElementKey,
      attribute: 'stroke',
      newValue: color
    };
  }

  bgColorChanged(color: string) {
    this.styleTransfer = {
      key: this.selectedElementKey,
      attribute: 'fill',
      newValue: color
    };
  }

  updateViewPort(x: number, y: number, w: number | null, h: number | null, force = false) {
    if (!force && this.cfg.viewPortLocked) {
      return;
    }
    if (w === null && h !== null) {
      w = this.canvasWidth * h / this.canvasHeight;
    }
    if (h === null && w !== null) {
      h = this.canvasHeight * w / this.canvasWidth;
    }
    if (!w || !h) {
      return;
    }

    this.cfg.viewPortX = parseFloat((1 * x).toPrecision(6));
    this.cfg.viewPortY = parseFloat((1 * y).toPrecision(6));
    this.cfg.viewPortWidth = parseFloat((1 * w).toPrecision(4));
    this.cfg.viewPortHeight = parseFloat((1 * h).toPrecision(4));
    this.strokeWidth = this.cfg.viewPortWidth / this.canvasWidth;
  }

  print() {
    // console.log(this.cfg);
    console.log(this.nodes);
  }

  afterSvgChange(svg: any) {
    this.newSvg = svg;
  }

  save() {
    console.log(this.svg);
  }

  saveSetting(type: string) {
    const keySetting = {
      key: this.selectedElementKey,
      type: type,
      setting: this.setting
    };
    const storedSetting = this.storage.loadSetting();
    if (storedSetting) {
      const settingList = JSON.parse(storedSetting);
      const index = settingList.findIndex((s: any) => s.key === this.selectedElementKey && s.type === type);
      if (index > -1) {
        settingList[index] = keySetting;
        this.storage.saveSetting(settingList);
      } else {
        settingList.push(keySetting);
        this.storage.saveSetting(settingList);
      }
    } else {
      this.storage.saveSetting([keySetting]);
    }
  }

  run() {
    this.modal.create({
      nzTitle: '运行',
      nzContent: RuntimeComponent,
      nzWidth: '100%',
      nzCentered: true,
      nzComponentParams: {
        svg: this.newSvg
      },
      nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
      nzFooter: null
    });
  }

}
