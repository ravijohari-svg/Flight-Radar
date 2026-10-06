/**
 * @description
 * This component is responsible for displaying the mission card on the ongoing missions page.
 * It takes the mission object as input and displays the mission details.
 * It also takes the latest mission logs as input and displays the latest mission log on toggle.
 * @author
 * Saroj Kumar Pahi
 */

import { Component, Input} from '@angular/core';
@Component({
  selector: 'app-mission-card',
  templateUrl: './mission-card.component.html',
  styleUrls: ['./mission-card.component.scss'],
})
export class MissionCardComponent {
  @Input() mission: any;
  @Input() latestMissionLogs: any;
  toggle = false;

  // This function is responsible for toggling the mission logs on click of the more/less details.
  onToggle(event: MouseEvent) {
    this.toggle = !this.toggle;
    event.stopPropagation();
  }
}
