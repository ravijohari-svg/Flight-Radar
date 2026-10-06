import { Pipe, PipeTransform } from '@angular/core';
/**
 * @description
 * This pipe is used to convert decimal degrees to degrees, minutes, and seconds (DMS) format for displaying coordinates.
 * The pipe takes a decimal degree value as input and returns a string in DMS format.
 * The pipe also takes an optional boolean parameter that indicates whether the value is a latitude or longitude.
 * @example
 * ```
 * // In your component:
 * latitude = 37.7749;
 *
 * // In your template:
 * <p>Latitude: {{ latitude | dmsCoordinate }}</p>
 * ```
 *
 * This will display the latitude value in DMS format, like this:
 *
 * ```
 * Latitude: 37° 46' 29.64" N
 * @author
 * Saroj Kumar Pahi
 */
@Pipe({
  name: 'dMScordinate',
})
export class DMScordinatePipe implements PipeTransform {
  transform(value: number, isLatitude: boolean = true): string {
    const degrees = Math.floor(value);
    const minutes = Math.floor((value - degrees) * 60);
    const seconds = ((value - degrees - minutes / 60) * 3600).toFixed(1);
    const direction = isLatitude
      ? value >= 0
        ? 'N'
        : 'S'
      : value >= 0
      ? 'W'
      : 'E';
    return `${Math.abs(degrees)}° ${minutes}' ${seconds}" ${direction}`;
  }
}
