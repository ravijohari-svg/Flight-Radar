/**
 * @description
 * This component is used to display live units data of drone in a dashboard.
 * The component also includes methods for copying the value to the clipboard and toggling between two different units of measurement.
 * This component takes the input and displays the value depending on the unit type.
 * @author
 * Saroj Kumar Pahi
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-live-units',
  templateUrl: './live-units.component.html',
  styleUrls: ['./live-units.component.scss'],
})
export class LiveUnitsComponent {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() value!: number;
  @Input() format!: string;
  @Input() unit1!: string;
  @Input() unit2!: string;

  toggle!: boolean;
  copiedToClipboard!: boolean;

  // This method is used to copy the value of the component to the clipboard when the user clicks on the clipboard icon.
  copyToClipboard() {
    this.copiedToClipboard = true;
    const el = document.createElement('textarea');
    el.value = this.value + '';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setTimeout(() => {
      this.copiedToClipboard = false;
    }, 500);
  }

  // This method is used to toggle between two different units of measurement when the user clicks on the toogle icon.
  toggleUnit() {
    this.toggle = !this.toggle;
  }
}
