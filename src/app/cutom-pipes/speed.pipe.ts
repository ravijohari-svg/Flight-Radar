import { Pipe, PipeTransform } from '@angular/core';
/**
 * @description
 * This pipe is used to convert speed values from meters per second to knots.
 *
 * @author
 * Saroj Kumar Pahi
 */
@Pipe({
  name: 'speed',
})
export class SpeedPipe implements PipeTransform {
  transform(value: number): number | string {
    return value * 1.94384;
  }
}
