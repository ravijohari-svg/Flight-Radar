import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OperatorlivedatacheckService } from 'src/app/custom-services/operator/operatorlivedatacheck.service';

//Report generation
import html2PDF from 'jspdf-html2canvas';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';

@Component({
  selector: 'app-operator-preflight-report',
  templateUrl: './operator-preflight-report.component.html',
  styleUrls: ['./operator-preflight-report.component.scss'],
})
export class OperatorPreflightReportComponent implements OnInit {
  private unSubscribe = new Subject<void>();

  missionPermissionsList;
  missionDetails;
  base64Report;

  profileDetails;
  mapScreenshotURL;
  coRelationFlag;
  reportValues;

  currentWeatherDetails;
  missionType;

  //Flying Risk Analysis
  flightriskScore;
  riskChartOptions;
  interesectionArr;

  constructor(
    private sharedDataService: OperatorlivedatacheckService,
    private operatorApi: OperatorapisService,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.profileDetails = this.operatorService.returnProfileDetails();
    this.getMissionDetails();
  }

  ngOnDestroy(): void {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }

  getMissionDetails() {
    this.sharedDataService
      .getNewMissionData()
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((data: any) => {
        this.reportValues = true;
        let missionId = data?.apiResponse.MissionId;
        this.mapScreenshotURL = data?.mapScreenshotURL;
        this.coRelationFlag = data?.coRelationFlag;
        this.missionDetails = data?.missionDetails;
        this.interesectionArr = this.missionDetails.Correlation;

        this.missionType =
          this.missionDetails.ActivityType.ActivityType.toLowerCase().includes(
            'bvlos'
          )
            ? 'BVLOS'
            : 'LOS';
        this.getWeather(
          this.missionDetails.Latitude[0],
          this.missionDetails.Longitude[0],
          missionId
        );
        // this.loader = false;
        if (data?.apiResponse.PermissionStatus) {
          this.missionPermissionsList = [
            { module: 'MissionParameters', category: [] },
            { module: 'DroneParameters', category: [] },
            { module: 'WeatherParameters', category: [] },
          ];

          let defaultPermissionList = [
            {
              Permission: 'Auto-Approve',
              Category: 'Activity Type',
              Module: 'MissionParameters',
            },
            {
              Permission: 'Auto-Approve',
              Category: 'Airspace Restrictions',
              Module: 'MissionParameters',
            },
            {
              Permission: 'Auto-Approve',
              Category: 'Flight Time',
              Module: 'MissionParameters',
            },
            {
              Permission: 'Auto-Approve',
              Category: 'Weather',
              Module: 'WeatherParameters',
            },
            {
              Permission: 'Auto-Approve',
              Category: 'UAV Info',
              Module: 'DroneParameters',
            },
          ];
          defaultPermissionList.forEach((defaultVal) => {
            let defaultCat = data?.apiResponse.PermissionStatus.some(
              (val) => val.Category == defaultVal.Category
            );
            if (!defaultCat)
              data?.apiResponse.PermissionStatus.push(defaultVal);
          });

          this.missionPermissionsList.forEach((modules) => {
            data?.apiResponse.PermissionStatus.forEach((permission) => {
              if (modules.module == permission.Module) {
                let categoryIndex = modules.category.findIndex(
                  (val) => val?.Name == permission?.Category
                );
                if (categoryIndex != -1) {
                  if (
                    !modules.category[categoryIndex].types.find(
                      (val) =>
                        val.Type == permission.Type &&
                        val.Permission == permission.Permission
                    )
                  ) {
                    modules.category[categoryIndex].types.push(permission);
                  }
                } else {
                  modules.category.push({
                    Name: permission.Category,
                    types: [permission],
                  });
                }
              }
            });
          });
          this.missionPermissionsList.forEach((modules) => {
            modules.category.forEach((category) => {
              category.permission = category.types.some(
                (type) => type.Permission == 'Auto-Reject'
              )
                ? 'Auto-Reject'
                : category.types.some((type) => type.Permission == 'Manual')
                ? 'Manual'
                : 'Auto-Approve';
            });
            modules = {
              ...modules,
            };
          });
          let tempPemissionList = [];
          this.missionPermissionsList.forEach((module) => {
            tempPemissionList.push(...module.category);
          });
          this.missionPermissionsList = tempPemissionList;
        }
        this.flightriskScore =
          Math.round(
            (data?.apiResponse?.FlyingRiskScore + Number.EPSILON) * 100
          ) / 100;
      });
  }
  // Weather details
  getWeather(lat, long, missionId) {
    // this.operatorApi
    //   .getCurrentWeather(Number(lat), Number(long))
    //   .then((res) => {
    //     this.currentWeatherDetails = res;
    //     setTimeout(() => {
    //       this.reportGeneration(missionId);
    //     }, 500);
    //   });
    let weatherAPIPayload = {
      latitude: Number(lat),
      longitude: Number(long),
    };
    this.operatorApi
      .getCurrentWeather_WeatherUnion(weatherAPIPayload)
      .then((res) => {
        let body = JSON.parse(res?.body);
        this.currentWeatherDetails = body;

        setTimeout(() => {
          this.reportGeneration(missionId);
        }, 500);
      });
  }
  // Printing mission
  async reportGeneration(missionId) {
    const pages: any = document.getElementsByClassName('page');
    const pdf = await html2PDF(pages, {
      jsPDF: {
        format: 'a4',
        unit: 'px',
      },
      // imageType: 'image/webp',
      imageType: 'image/jpeg',
      imageQuality: 0.5,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      // output: undefined,
      success: (pdf) => {
        // this.loader = false;
        // pdf.save(this.output);
        var blob = pdf.output('blob');
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          // Added for dev purpose
          // pdf.save('preflight.pdf');

          this.base64Report = reader.result;

          setTimeout(() => {
            this.generateReport(missionId);
          }, 300);
        };
      },
      // devicePixelRatio: 2.5,
      // output: './pdf/generate.pdf',
      // './pdf/generate.pdf'
    });
  }
  //Report Generation API
  generateReport(missionId) {
    let payload = {
      OperatorId: this.profileDetails.UserId,
      Base64: this.base64Report,
      DocType: 'pdf',
      MissionId: missionId,
    };

    // Addec for dev purpose
    // this.reportValues = false;

    // Commented for dev purpose
    this.operatorApi.preflightDocument(payload).subscribe({
      next: (res) => {
        this.reportValues = false;
      },
      error: () => {},
    });
  }
}
