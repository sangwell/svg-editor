import {Directive, ElementRef, OnDestroy, OnInit, Renderer2, ViewContainerRef} from '@angular/core';
import {interval} from 'rxjs';
import {StorageService} from "../../storage.service";

/** 闪烁动画指令 */
@Directive({
  /* eslint-disable @angular-eslint/directive-selector */
  selector: '[mm-visibility-animation-processor]'
})
export class VisibilityAnimationProcessor implements OnInit {


  constructor(viewContainerRef: ViewContainerRef, private elementRef: ElementRef, private render: Renderer2,
              private storage: StorageService) {
  }

  ngOnInit() {
    const storedSettings = this.storage.loadSetting();
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      const visibilitySetting = settings.find((s: any) => s.type === 'visibility');
      if (!visibilitySetting) {
        return;
      }
      const key = visibilitySetting.key;
      console.log(key);
      const selectedItem: any = this.findSvgItemByKey(this.elementRef.nativeElement.children[0], key);
      interval(1000).subscribe(() => {
        if (Math.random() > 0.5) {
          selectedItem.setAttribute('visibility', 'hidden');
        } else {
          selectedItem.setAttribute('visibility', 'visible');
        }
      })
    }

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
}
