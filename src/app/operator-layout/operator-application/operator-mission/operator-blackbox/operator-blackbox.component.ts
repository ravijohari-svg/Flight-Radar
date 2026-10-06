import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-operator-blackbox',
  templateUrl: './operator-blackbox.component.html',
  styleUrls: ['./operator-blackbox.component.scss'],
})
export class OperatorBlackboxComponent implements OnInit {
  blackBoxIndex = 0;
  //Operator Details
  operatorId;
  //Mission Details
  missionId;

  missionStatus;
  constructor() {}

  ngOnInit(): void {}
}
