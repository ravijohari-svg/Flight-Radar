import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})
/**
 * Service for managing notifications within the application.
 */
export class NotificationService {
  private notifyRequest = new ReplaySubject<Notification>();

  notifyRequest$ = this.notifyRequest.asObservable();

  constructor() {}
  /**
   * Notifies the application with a new notification.
   *
   * @param notification The notification to be displayed.
   *                     It should be an object of type 'Notification'.
   */
  notify(notification: Notification) {
    const newNotification = notification;
    if (typeof notification.duration == 'number') {
      newNotification.duration = notification.duration;
    } else if (notification.duration == 'never') {
      newNotification.duration = 0;
      newNotification.removeClose = false;
    } else {
      // default duration is 5 second
      newNotification.duration = 5000;
    }
    this.notifyRequest.next(newNotification);
  }
  /**
   * Clears the currently displayed notification.
   * This function is used to dismiss the currently displayed notification.
   * Should be called on ngOnDestory to remove the persistent notification.
   * It emits a `null` value to the `notifyRequest$` observable.
   */
  clearNotifications() {
    // when you
    this.notifyRequest.next(null);
  }
}
