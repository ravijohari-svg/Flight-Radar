import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveCardComponent } from './live-card/live-card.component';
import { WeatherCardComponent } from './weather-card/weather-card.component';
/**
 * @description
 * This module is responsible for importing and exporting all the common components.
 * It also imports the custom pipes module and the material slide toggle module.
 * The common components are:Live Card, Weather Card, Live Units.
 * The Live Card component is responsible for displaying the live card on the dashboard(authority and operator) page.
 * The Weather Card component is responsible for displaying the weather card on the dashboard(authority and operator) page.
 * The Live Units component is responsible for displaying the live units on the dashboard(authority and operator) page.
 * @author
 * Saroj Kumar Pahi
 */

import { LiveUnitsComponent } from './live-card/live-units/live-units.component';
import { CustomPipesModule } from '../cutom-pipes/custom-pipes.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapUiComponent } from './map-ui/map-ui.component';
import { CorrelationCardComponent } from './correlation-card/correlation-card.component';
import { WaypointFormCardComponent } from './waypoint-form-card/waypoint-form-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './loader/loader.component';
import { NotificationComponent } from './notification/notification.component';
import { CarouselComponent } from './carousel/carousel.component';
import { HeatmapComponent } from './heatmap/heatmap.component';

@NgModule({
  declarations: [
    LiveCardComponent,
    WeatherCardComponent,
    LiveUnitsComponent,
    MapUiComponent,
    CorrelationCardComponent,
    WaypointFormCardComponent,
    LoaderComponent,
    NotificationComponent,
    CarouselComponent,
    HeatmapComponent,
  ],
  imports: [
    CommonModule,
    CustomPipesModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    LiveCardComponent,
    WeatherCardComponent,
    LiveUnitsComponent,
    MapUiComponent,
    WaypointFormCardComponent,
    CorrelationCardComponent,
    LoaderComponent,
    NotificationComponent,
    CarouselComponent,
    HeatmapComponent,
  ],
})
export class CommonComponentsModule {}
