import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

@Component({
  selector: 'app-authority-pilots-list',
  templateUrl: './authority-pilots-list.component.html',
  styleUrls: ['./authority-pilots-list.component.scss']
})
export class AuthorityPilotsListComponent implements OnInit {

  // Loader
  loader;

  //Pilots List
  pilotsList;
  constructor(private authorityApi: AuthorityapisService, private activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.initialFunction();
  }
  initialFunction() {
    if (this.activeRoute.snapshot.paramMap.get('metric')) {
      let encryptedData = decodeURI(this.activeRoute.snapshot.paramMap.get('metric'));
      let decryptedMetric = JSON.parse(atob(encryptedData));
      this.getFilteredPilotsList(decryptedMetric);
    }
  }

  getFilteredPilotsList(metric) {
    this.loader = true;
    // metric.Days
    let payload = {
      Days: metric.Days
    }
    this.authorityApi.getFilteredPilotsList(payload).subscribe((res) => {
      this.pilotsList = res.data.MainData;
      this.loader = false;
    })
  }
}
