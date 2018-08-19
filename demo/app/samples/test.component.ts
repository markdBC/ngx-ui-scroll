import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Datasource } from '../../../public_api'; // from 'ngx-ui-scroll';

const MAX = 500;
const MIN = -1000;

interface MyItem {
  id: number;
  text: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-samples-test-inner',
  template: '<b><ng-content></ng-content></b>'
})
export class TestInnerComponent {
  constructor() {
  }
}

@Component({
  selector: 'app-samples-test',
  templateUrl: './test.component.html'
})
export class TestComponent {

  reloadIndex = 1;
  datasourceDelay = 0;
  data: Array<MyItem>;

  datasource = new Datasource({
    get: (index: number, count: number) =>
      this.fetchData(index, count)
    ,
    settings: {
      bufferSize: 10,
      minIndex: MIN,
      itemSize: 20
    },
    devSettings: {
      debug: true,
      immediateLog: false,
      logTime: true,
      throttle: 40,
      inertia: false,
      inertiaScrollDelay: 125,
      inertiaScrollDelta: 35
    }
  });

  constructor() {
    this.data = [];
    for (let i = 0; i <= MAX - MIN; i++) {
      this.data.push(<MyItem>{
        id: i + MIN,
        text: 'item #' + (i + MIN),
        isSelected: i % 15 === 0
      });
    }
    this.datasource.adapter.firstVisible$
      .subscribe((result) => {
        console.log('..............................first visible item:', result.data);
      });
  }

  fetchData(index: number, count: number): Observable<Array<MyItem>> {
    const data: Array<MyItem> = [];
    const start = Math.max(MIN, index);
    const end = Math.min(MAX, index + count - 1);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push(this.data[i - MIN]);
      }
    }
    return Observable.create((observer: Observer<any>) => {
      if (!this.datasourceDelay) {
        observer.next(data);
      } else {
        setTimeout(() => observer.next(data), this.datasourceDelay);
      }
    });
  }

  getVisibleItemsCount(): number {
    const adapter = this.datasource.adapter;
    let last = <number>adapter.lastVisible.$index;
    last = Number.isInteger(last) ? last : NaN;
    let first = <number>adapter.firstVisible.$index;
    first = Number.isInteger(first) ? first : NaN;
    return (Number.isNaN(last) || Number.isNaN(first)) ? 0 : last - first + 1;
  }

  getViewportElement(): Element {
    return document.getElementsByClassName('viewport')[0];
  }

  doScroll(limit: number, delay: number, delta: number) {
    const viewportElement = this.getViewportElement();
    setTimeout(() => {
      viewportElement.scrollTop -= delta;
      if (--limit > 0) {
        this.doScroll(limit, delay, delta);
      }
    }, delay);
  }

  doReload() {
    this.datasource.adapter.reload(this.reloadIndex);
  }

  doScrollHome() {
    // this.doScroll(400, 25, 1);
    this.getViewportElement().scrollTop = 0;
  }

  doScrollEnd() {
    this.getViewportElement().scrollTop = 999999;
  }

  doLog() {
    this.datasource.adapter.showLog();
  }

  doToggleItem(item: MyItem) {
    item.isSelected = !item.isSelected;
  }
}
