import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { assets } from 'src/app/constants/constants';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('bounce', [
      state('void', style({ transform: 'translateY(100%)' })),
      transition('*=>*', [
        animate(
          '0.3s',
          keyframes([
            style({ transform: 'translateY(100%)', offset: 0 }),
            style({ transform: 'translateY(0px)', offset: 0.5 }),
            style({ transform: 'translateY(0px)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('dotAnimation', []),
  ],
})
export class LoaderComponent {
  @Input() PhaseKey!: any;

  getAssetDetails(key: string) {
    return assets.find((asset) => asset.key === key);
  }
}
