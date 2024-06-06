import {Directive, ElementRef, OnDestroy, OnInit, Renderer2, ViewContainerRef} from '@angular/core';
import {interval} from 'rxjs';
import {StorageService} from "../../storage.service";
import anime from 'animejs';

/** 闪烁动画指令 */
@Directive({
  /* eslint-disable @angular-eslint/directive-selector */
  selector: '[mm-move-animation-processor]'
})
export class MoveAnimationProcessor implements OnInit {


  constructor(viewContainerRef: ViewContainerRef, private elementRef: ElementRef, private render: Renderer2,
              private storage: StorageService) {
  }

  ngOnInit() {
    console.log(this.elementRef.nativeElement.children[0]);
    const storedSettings = this.storage.loadSetting();
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      const visibilitySetting = settings.find((s: any) => s.type === 'move');
      if (!visibilitySetting) {
        return;
      }
      const key = visibilitySetting.key;
      const selectedItem: any = this.findSvgItemByKey(this.elementRef.nativeElement.children[0], key);
      interval(1000).subscribe(() => {
        // todo old
        // selectedItem.setAttribute('cx', Math.random() * 100 + 50);
        // todo new
        anime({
          targets: selectedItem,
          translateX: Math.random() * 100 + 50,
          direction: 'alternate',
          loop: true,
          // delay: 100,
          // endDelay: 100,
          // duration: 1000,
          easing: 'easeInOutQuad'
        });
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
