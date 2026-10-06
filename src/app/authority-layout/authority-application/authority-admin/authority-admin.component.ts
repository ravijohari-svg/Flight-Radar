import { Component, OnInit } from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

@Component({
  selector: 'app-authority-admin',
  templateUrl: './authority-admin.component.html',
  styleUrls: ['./authority-admin.component.scss']
})
export class AuthorityAdminComponent implements OnInit {

  //Regulators/Authority data
  regulatorsData = [];
  //How many Regulators/Authority users are presenet
  regulatorsDataLength;
  //Pilots data
  pilotsData = [];
  //Pilots Users count
  pilotsDataLength;
  constructor(private authorityApi: AuthorityapisService) { }

  ngOnInit(): void {
    this.initialApiCall();
  }

//Contain those functionality needed at first run of this component
  initialApiCall() {
    //API with promises (New version)
    //API to get the  Regulators/Authority data
    this.authorityApi.getAuthoritiesProfileDetails().then(
      (res) => {
        this.regulatorsData = res['data']?.MainData
        this.regulatorsDataLength = this.regulatorsData.length
      },
      (err) => {
        // this.regulatorsData ='!'
      }
    )

    //API with promises (New version)
    //API to get the  Pilots data
    this.authorityApi.getOperatorsDetails().then(
      (res) => {
      this.pilotsData = res['data']?.MainData
      this.pilotsDataLength = this.pilotsData.length
    },
      (err) => {
      }
    );

  }

}
