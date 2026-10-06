import { Pipe, PipeTransform } from '@angular/core';
/**
 * @description
 * This pipe is used for the meter to feet conversion.
 * @author
 * Saroj Kumar Pahi
 */
@Pipe({
  name: 'metertofeet',
})
export class MetertofeetPipe implements PipeTransform {
  transform(value: number): number {
    const feet = value * 3.28084;
    return Math.round(feet * 100) / 100; // round to 2 decimal places
  }
}
