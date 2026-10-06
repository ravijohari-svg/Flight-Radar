import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'meterToKm'
})
export class MeterToKmPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): number {
       // Convert meters to kilometers
       return value / 1000;
  }
}
