import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {  switchMap, tap } from 'rxjs/operators';
import {
  Notification,
} from '../../custom-services/notification-service/notification';

//Importing notification service
import { NotificationService } from '../../custom-services/notification-service/notification.service';
import { Observable, timer } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  // if the notification should be visible or not.
  showNotification: boolean = false;

  //data that is going to be showed.
  incommingNotification: Notification = {
    title: '',
    message: '',
    type: '',
    position: '',
    duration: '',
    removeClose: '',
  };
  notificationSubscriber: any;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  get resolvedPosition(): string {
    if (this.incommingNotification.position) {
      return this.incommingNotification.position;
    }

    return this.isMissionPlannerView() ? 'top-right' : 'bottom-right';
  }

  private isMissionPlannerView(): boolean {
    return this.router.url.includes('/mission-planner');
  }

  ngOnInit(): void {
    //We subscribe or listens to new values / notification requests.
    this.notificationSubscriber = this.notificationService.notifyRequest$
      .pipe(
        tap((notification: Notification) => {
          if (notification) {
            this.incommingNotification = notification;
            this.showNotification = true;
          } else {
            this.showNotification = false;
          }
        }),
        switchMap((notification) => {
          if (notification) {
            const duration =
              typeof notification.duration === 'number'
                ? notification.duration
                : 3000;
            return timer(duration);
          } else {
            return new Observable();
          }
        }),
        tap(() => {
          if (this.incommingNotification.duration !== 0) {
            this.showNotification = false;
          }
        })
      )
      .subscribe();
  }

  close() {
    this.showNotification = false;
  }

  ngOnDestroy(): void {
    this.notificationSubscriber.unsubscribe();
  }
}
