import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-authority-blackbox',
  templateUrl: './authority-blackbox.component.html',
  styleUrls: ['./authority-blackbox.component.scss'],
})
export class AuthorityBlackboxComponent implements OnInit {
  blackBoxIndex = 0;

  //Operator Details
  operatorId;
  //Mission Details
  missionId;

  missionStatus;
  constructor() {}

  ngOnInit(): void {}
}
