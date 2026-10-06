import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeFormatService {

  constructor() { }

  dateAndTimeFormatting(val,type) {
    let date = new Date(val);
    let year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    let dt: any = date.getDate();
    let hrs: any = date.getHours();
    let mins: any = date.getMinutes();
    let sec: any = date.getSeconds();
    let milSec: any = date.getMilliseconds();
    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }
    if (hrs < 10) {
      hrs = '0' + hrs;
    }
    if (mins < 10) {
      mins = '0' + mins;
    }
    if (sec < 10) {
      sec = '0' + sec;
    }
    if (milSec < 10) {
      milSec = '00' + milSec;
    } else if (milSec >= 10 && milSec < 100) {
      milSec = '0' + milSec;
    }
    if(type == 'date') {
      return [year, month, dt].join('-');
    } else if(type == 'date-inverse') {
      return [dt,month,year].join('-');
    } else if(type == 'time') {
      return [hrs, mins, sec].join(':');
    } else if(type == 'dateAndTime') {
      return year + '-' + month + '-' + dt + 'T' + hrs + ':' + mins;
    } else if(type == 'fulldateAndTime') {
      return year + '-' + month + '-' + dt + 'T' + hrs + ':' + mins + ':' + sec + '.' + milSec;
    } else if(type == 'fulldateAndTimeZ') {
      return year + '-' + month + '-' + dt + 'T' + hrs + ':' + mins + sec + '.' + milSec + 'Z';
    }
  }

}
