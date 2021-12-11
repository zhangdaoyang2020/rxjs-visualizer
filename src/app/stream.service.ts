import { Injectable } from '@angular/core';
import { of, Observable, merge, interval, Subject, timer } from 'rxjs';
import { map, take, debounceTime, throttleTime, distinctUntilChanged, skip, switchMap, filter, finalize, delay } from 'rxjs/operators';

import { StreamData } from './class/stream-data';

//
@Injectable({
  providedIn: 'root'
})
export class StreamService {
  items: StreamData[] = [];
  operators = [
    'of',
    'map',
    'filter',
    'throttleTime',
    'debounceTime',
    'distinctUntilChanged',
    'merge',
    'switchMap',
    'skip',
    'take',
    'finalize'
  ];
  stream = new Subject<any>();
  stream$ = this.stream.asObservable();

  constructor() {}

  // ストリームにデータを流す
  do(x) {
    this.stream.next(x);
  }

  // インジケータ表示用のデータを追加
  add(value) {
    this.items.push(new StreamData(value));

    setTimeout(() => {
      this.items.pop();
    }, 100);
  }

  // ========================
  // Operators
  // ========================

  of(): Observable<string> {
    return this.stream$;
  }

  map(): Observable<string> {
    return this.stream$
      .pipe(
        map(x => `map: ${x}`)
      );
  }

  filter(): Observable<string> {
    return this.stream$
      .pipe(
        filter(x => x === 'test'),
        map(x => `filter() matched: ${x}`)
      );
  }

  throttleTime(): Observable<string> {
    return this.stream$
      .pipe(
        throttleTime(250),
        map(x => `throttleTime(250): ${x}`)
      );
  }

  debounceTime(): Observable<string> {
    return this.stream$
      .pipe(
        debounceTime(250),
        map(x => `debounceTime(250): ${x}`)
      );
  }

  distinctUntilChanged(): Observable<string> {
    return this.stream$
      .pipe(
        distinctUntilChanged(),
        map(x => `distinctUntilChanged: ${x}`)
      );
  }

  merge(): Observable<StreamData> {
    return merge(
      interval(1200).pipe(
        take(4),
        map((index) => `(a: ${index + 1} / 4)`)
      ),
      interval(500).pipe(
        take(10),
        map((index) => `(b: ${index + 1} / 10)`)
      )
    ).pipe(
      map(x => {
        let result = null;

        if (x.startsWith('(a')) {
          result = { message: `merge: ${x}`, color: 'rgb(226, 149, 126)' };
        } else if (x.startsWith('(b'))  {
          result = { message: `merge: ${x}`, color: 'rgb(126, 226, 134)' };
        } else {
          result = { message: `merge: ${x}` };
        }

        return result as StreamData;
      })
    );
  }

  switchMap(): Observable<string> {
    return this.stream$
      .pipe(
        switchMap(x => {
          return interval(1000).pipe(
            take(5),
            map((index) => `switchMap: ${index} => ${x}`)
          );
        })
      );
  }

  skip(): Observable<string> {
    return this.stream$
      .pipe(
        skip(3),
        map(x => `skip: ${x}`)
      );
  }

  take(): Observable<string> {
    let count = 0;
    return this.stream$
      .pipe(
        take(3),
        map(x => `take(${++count}): ${x}`)
      );
  }

  finalize(): Observable<any> {
    return this.stream$
      .pipe(
        switchMap(() => {
          return interval(1000)
            .pipe(
              map(index => `finalize(map): ${index + 1}`),
              take(3),
              finalize(() => {
                setTimeout(() => this.add({ message: 'finalize!'}), 100);
              }),
            );
        })
      );
  }
}
