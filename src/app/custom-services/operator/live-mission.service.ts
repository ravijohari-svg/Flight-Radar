import { Injectable } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveMissionService {

  //Subject
  private unSubscribe;

  constructor() { }

  onSubscribe(liveDroneSubscription) {
    this.unSubscribe = liveDroneSubscription;
    return interval(2000)
    .pipe(takeUntil(this.unSubscribe))
    .subscribe(() => {
    })
  }
  onUnsubscribe() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

}
