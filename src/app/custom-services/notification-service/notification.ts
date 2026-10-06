export enum NotificationType {
  success = 'is-success',
  danger = 'is-danger',
  warning = 'is-warning',
}

export enum NotificationPostion {
  'centerBottom' = 'center-bottom',
  'centerTop' = 'center-top',
  'topLeft' = 'top-left',
  'topRight' = 'top-right',
  'bottomLeft' = 'bottom-left',
  'bottomRight' = 'bottom-right',
}

/**
 * Represents a notification object.
 */
export interface Notification {
  /**
   * The title of the notification.
   */
  title: string;

  /**
   * The optional message content of the notification.
   */
  message?: string;

  /**
   * The type of the notification (e.g., success, error, warning).
   */
  type?: NotificationType | '';

  /**
   * The duration for which the notification should be displayed
   * (in milliseconds), or 'never' for indefinite duration.
   * default duration is 5 seconds
   */
  duration?: number | 'never' | '';

  /**
   * Indicates whether a close button should be displayed to allow
   * the user to manually close the notification.
   */
  removeClose?: boolean | '';

  /**
   * The position at which the notification should be displayed
   * (e.g., center-bottom, bottom-left, top-left).
   * should be default.
   */
  position?: NotificationPostion | '';
}
