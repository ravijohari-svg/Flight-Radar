/**
 * @description
 * This component is used to display live mission logs data of drone in a dashboard.
 * @author
 * Saroj Kumar Pahi
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-live-card',
  templateUrl: './live-card.component.html',
  styleUrls: ['./live-card.component.scss'],
})
export class LiveCardComponent {
  @Input() liveLatitude: number;
  @Input() liveLongitude: number;
  @Input() liveAltitude: number;
  @Input() battery_remaining: number;
  @Input() batteryVoltage: number;
  @Input() groundspeed: number;
  @Input() flightTime: number;
  @Input() distTraveled: number;
  @Output() trackDrone = new EventEmitter();
  @Output() changeToOneLap = new EventEmitter();
  @Input() showOneLap: any;
  @Input() droneFollow: boolean = false;
  @Input() mode: boolean = false;
  @Input() modeVal: string;
  TrackDrone() {
    this.trackDrone.emit();
  }

  connectToOneLap() {
    this.changeToOneLap.emit();
  }
}
