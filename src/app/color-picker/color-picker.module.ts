import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ColorSketchModule} from 'ngx-color/sketch';
import {ColorPickerComponent} from './color-picker.component';

@NgModule({
  imports: [CommonModule, ColorSketchModule, NzPopoverModule],
  declarations: [ColorPickerComponent],
  exports: [ColorPickerComponent]
})
export class ColorPickerModule {
}
