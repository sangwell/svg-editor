import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {StorageService} from "../storage.service";

@Component({
  selector: 'app-runtime',
  templateUrl: './runtime.component.html',
  styleUrls: ['./runtime.component.scss']
})
export class RuntimeComponent implements OnInit, AfterViewInit {
  @Input() svg: any;

  @ViewChild('container') container: any;

  svgTemplate: any;

  constructor(private domSanitizer: DomSanitizer,
              private storage: StorageService) {
  }

  ngOnInit() {
    this.svgTemplate = this.domSanitizer.bypassSecurityTrustHtml(this.svg);
  }

  ngAfterViewInit() {
    // console.log('container=====', this.container.nativeElement.children[0]);
  }

}
