import {Component, EventEmitter, Input, Output} from '@angular/core';

/** 颜色选择控件 */
@Component({
  selector: 'mm-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent {
  /** 颜色 */
  @Input() color: string = '';

  @Output() colorChanged = new EventEmitter<string>();

  colorChangeComplete(event: any) {
    console.log(event.color.hex);
    this.color = event.color.hex;
    this.colorChanged.emit(event.color.hex);
  }
}
