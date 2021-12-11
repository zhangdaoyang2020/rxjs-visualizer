import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as hljs from 'highlight.js';

import { StreamService } from '../stream.service';
import { LogService } from '../log.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('itemState', [
      state('in', style({ left: 0 })),
      transition('void => *', [
        style({ left: '-30px' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(1000, style({ left: '100%' }))
      ])
    ])
  ]
})
export class MainComponent implements OnInit {
  el: HTMLElement;
  $logger: Element;
  $codeBlock: Element;
  message = 'test';
  source: Subscription;
  selectedOperator = '';

  constructor(
    el: ElementRef,
    public streamService: StreamService,
    public logService: LogService
  ) {
    this.el = el.nativeElement;
  }

  ngOnInit() {
    this.$logger = this.el.querySelector('.logger');
    this.$codeBlock = this.el.querySelector('.code-block');
    this.source = this.streamService.of().subscribe(message => {
      this.streamService.add({ message });
    });
    this.selectedOperator = 'of';
    setTimeout(() => { hljs.highlightBlock(this.$codeBlock.querySelector('.typescript')); }, 50);
  }

  onSelect(event) {
    this.source.unsubscribe();

    if (!event.target.value) { return; }

    const operator = event.target.value;
    this.source = this.streamService[operator]().subscribe(value => {
      if (typeof value === 'string') {
        this.streamService.add({ message: value });
      } else {
        this.streamService.add(value);
      }
    });

    this.selectedOperator = operator;
    setTimeout(() => { hljs.highlightBlock(this.$codeBlock.querySelector('.typescript')); }, 50);
  }

  onEnter(event): void {
    event.preventDefault();
    this.streamService.do(this.message || 'blank');
  }

  onKeyup(event): void {
    if (event.which === 13) {
      this.streamService.do(this.message || 'blank');
    }
  }

  log(event, data): void {
    if (event.fromState === null) {
      this.logService.add(data);
    }

    setTimeout(() => {
      this.$logger.scrollTop = this.$logger.querySelector('ul').clientHeight - 130;
    }, 0);
  }

  clearLog(): void {
    this.logService.reset();
  }
}
