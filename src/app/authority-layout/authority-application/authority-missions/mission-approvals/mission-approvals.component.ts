import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

@Component({
  selector: 'app-mission-approvals',
  templateUrl: './mission-approvals.component.html',
  styleUrls: ['./mission-approvals.component.scss']
})
export class MissionApprovalsComponent implements OnInit {
  //Missions List
  allMissions;
  approvedMissions;
  rejectedMissions;
  constructor(private authorityApi : AuthorityapisService) { }

  ngOnInit(): void {
    this.initialFunction();
  }
  initialFunction() {
    this.authorityApi.getAllMissionsList().subscribe((res)=> {
     this.allMissions = res.data.MainData;
    }, (err) => {
    })
  }
}
