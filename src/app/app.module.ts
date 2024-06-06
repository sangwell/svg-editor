import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {NZ_I18N} from 'ng-zorro-antd/i18n';
import {zh_CN} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NzTreeModule} from 'ng-zorro-antd/tree';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {CanvasComponent} from './canvas/canvas.component';
import {NzFormModule} from 'ng-zorro-antd/form';
import {ColorSketchModule} from 'ngx-color/sketch';
import {NzPopoverModule} from 'ng-zorro-antd/popover';
import {ColorPickerModule} from "./color-picker/color-picker.module";
import {AccountBookFill, AlertFill, AlertOutline} from '@ant-design/icons-angular/icons';
import {RuntimeComponent} from "./runtime/runtime.component";
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {VisibilityAnimationProcessorModule} from "./processors/twinkle-animation-processor";
import {MoveAnimationProcessorModule} from "./processors/move-animation-processor";
import { NzTreeViewModule } from 'ng-zorro-antd/tree-view';

const icons = [AccountBookFill, AlertOutline, AlertFill];

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    RuntimeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzTreeModule,
    NzIconModule.forRoot(icons),
    NzFormModule,
    ColorSketchModule,
    NzPopoverModule,
    ColorPickerModule,
    NzModalModule,
    ReactiveFormsModule,
    NzInputModule,
    NzInputNumberModule,
    VisibilityAnimationProcessorModule,
    MoveAnimationProcessorModule,
    NzTreeViewModule
  ],
  providers: [
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
