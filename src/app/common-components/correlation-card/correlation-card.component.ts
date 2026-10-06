/**
 * @description
 * This component is a correlation-card which is used in create mission module to show your waypoints lie on which zone.
 * When user upload the waypoints it shows which waypoint are on which type of  zone.
 * Zones are divided into 4 parts inner zones,outer zones, redzones,green zones.
 * This gives information related to the zones also when user click on the down button of the accordion.
 * @author
 * Abhishek chauhan
 */

import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-correlation-card',
  templateUrl: './correlation-card.component.html',
  styleUrls: ['./correlation-card.component.scss']
})
export class CorrelationCardComponent implements OnInit {
  expandedAccordionIndex: number;
  @Input() index:any;
  @Input() innerYellow:any;
  @Input() outerYellow:any;
  @Input() redZone:any;
  @Input() geoZone:any;

  constructor() { }

  ngOnInit(): void {
  }
  toggleAccordion(index: number) {
    if (this.expandedAccordionIndex === index) {
      this.expandedAccordionIndex = -1; // Collapse
    } else {
      this.expandedAccordionIndex = index; // Expand
    }
  }
}
