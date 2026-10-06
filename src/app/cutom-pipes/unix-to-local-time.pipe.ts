import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unixToLocalTime',
})
export class UnixToLocalTimePipe implements PipeTransform {
  transform(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      // year: 'numeric',
      // month: 'numeric',
      // day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return date.toLocaleString('en-IN', options);
  }
}
