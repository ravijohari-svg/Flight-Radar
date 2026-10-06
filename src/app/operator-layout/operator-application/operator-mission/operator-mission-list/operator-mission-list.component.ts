import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-operator-mission-list',
  templateUrl: './operator-mission-list.component.html',
  styleUrls: ['./operator-mission-list.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorMissionListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
