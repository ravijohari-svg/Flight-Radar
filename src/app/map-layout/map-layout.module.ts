/**
 * @description
 * This module contains all the components and modules related to the map layout.
 * It exports the reusable directive which is used to display single view map with doesn't rerenders on page change.
 * @author
 * Saroj Kumar Pahi
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { ReusableDirective } from './map/resuable-outlet.directive';

@NgModule({
  declarations: [MapComponent, ReusableDirective],
  imports: [CommonModule],
  exports: [ReusableDirective],
})
export class MapLayoutModule {}
