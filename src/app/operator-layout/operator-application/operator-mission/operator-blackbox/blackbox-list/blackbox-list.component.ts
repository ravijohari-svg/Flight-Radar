import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { Router } from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
@Component({
  selector: 'app-blackbox-list',
  templateUrl: './blackbox-list.component.html',
  styleUrls: ['./blackbox-list.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlackboxListComponent implements OnInit {
  //Profile Details
  profileDetails;

  //Black Box Index Details

  blackBoxListArr;

  //Loader
  loader;

  // Filters and SearchBy
  missionSearchBy = [];
  selected;
  userDetailsVal;
  rawData;
  searchByFlag;

  //pagination
  paginationKey;
  paginationArray = [];
  pageArray = [];
  indexing;
  htmlIndexing;
  logTimeAndDistance = {
    logDistTraveled: 0,
    logFlyingTime: '0h : 0m',
    totalMissionTime: '0h : 0m',
  };

  constructor(
    private operatorApi: OperatorapisService,
    private dateAndTimeFormat: DateTimeFormatService,
    private router: Router,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }

  //Contain those functionality needed at first run of this component
  initialFunction() {
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();
    this.loader = true;
    let payload = {
      OperatorId: this.profileDetails.UserId,
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'fulldateAndTimeZ'
      ),
    };
    this.operatorApi.getBlackBoxList(payload).then(
      (res) => {
        this.indexing = 0;
        this.pageArray.push(this.indexing);
        this.paginationKey = res['data'].MainData.PaginationKey;
        let arr = [];
        this.loader = false;
        this.blackBoxListArr = res['data'].MainData.MissionList;
        // this.rawData = this.blackBoxListArr;
        if (this.blackBoxListArr.length != 0) {
          // this.blackBoxListArr.map((val) => {
          //   arr.push({ 'MissionId': val.MissionId, 'OperatorId': val.OperatorId, 'CreatedByName': val.CreatedByName, 'custom': val.MissionId + ', ' + val.OperatorId + ', ' + val.CreatedByName })
          // })
          // this.missionSearchBy = arr;
          this.paginationArray.push(this.blackBoxListArr);
          if (this.blackBoxListArr.length != 0) {
            this.paginationArray[this.indexing].map((val) => {
              arr.push({
                MissionId: val.MissionId,
                OperatorId: val.OperatorId,
                CreatedByName: val.CreatedByName,
                custom:
                  val.MissionId +
                  ', ' +
                  val.OperatorId +
                  ', ' +
                  val.CreatedByName,
              });
            });
          }
          this.rawData = this.paginationArray[this.indexing];
          this.missionSearchBy = arr;
        }
      },
      (err) => {
        this.loader = false;
      }
    );
    //For Log Distance and time
    this.logTimeAndDistanceFormer(this.profileDetails);
  }

  logTimeAndDistanceFormer(data) {
    let payload = { EmailId: data.EmailId, UserId: data.EmailId };
    this.operatorApi.getProfileDetails(payload).then((res: any) => {
      let userData = res.data.MainData;
      if (userData?.LogDistTraveled && userData?.LogFlyingTime) {
        let formattedLogDistTraveled = userData?.LogDistTraveled.toFixed(2);
        let formattedLogFlyingTime = userData?.LogFlyingTime.toFixed(2);
        let result = {
          logDistTraveled: parseFloat(formattedLogDistTraveled),
          logFlyingTime: parseFloat(formattedLogFlyingTime),
        };
        let hours = Math.floor(result.logFlyingTime / 60);
        let remainingMinutes = Math.round(result.logFlyingTime % 60);
        let formattedTime = `${hours}h : ${remainingMinutes}m`;
        this.logTimeAndDistance.logDistTraveled = result.logDistTraveled;
        this.logTimeAndDistance.logFlyingTime = formattedTime;
      }
      if (userData?.TotalMissionTime) {
        let hours = Math.floor(userData?.TotalMissionTime / 60);
        let remainingMinutes = Math.round(userData?.TotalMissionTime % 60);
        let formattedTime = `${hours}h : ${remainingMinutes}m`;
        this.logTimeAndDistance.totalMissionTime = formattedTime;
      }
    });
  }

  encrypt(event) {
    let encrydata = CryptoJS.AES.encrypt(
      JSON.stringify(event),
      environment.operatorKey
    );
    let encryData = encrydata.toString();
    return encryData;
  }

  onBlackBoxDetail(MissionId) {
    MissionId = this.encrypt(MissionId);
    this.router.navigate([
      'operator/operator-app/mission/blackbox/missionlist',
      MissionId,
    ]);
  }

  //Search
  searchByOnSelect(e) {
    this.searchByFlag = true;
    // this.blackBoxListArr = this.rawData;
    // this.blackBoxListArr = this.blackBoxListArr.filter((data) => {
    //   return data.MissionId == e.item.MissionId ? data : null;
    // });
    this.paginationArray[this.indexing] = this.rawData;
    this.paginationArray[this.indexing] = this.paginationArray[
      this.indexing
    ].filter((data) => {
      return data.MissionId == e.item.MissionId ? data : null;
    });
  }
  clearSearch() {
    this.selected = '';
    this.searchByFlag = false;
    // this.blackBoxListArr = this.rawData;
    this.paginationArray[this.indexing] = this.rawData;
  }
  //Key Down Event
  onKeyDownEvent(e) {
    if (e.keyCode == 13) {
      this.onSearchKeyWord();
    }
  }

  onSearchKeyWord() {
    this.searchByFlag = true;
    // this.blackBoxListArr = this.rawData;
    this.paginationArray[this.indexing] = this.rawData;
    let fileteredArr = this.missionSearchBy
      .filter((data) => {
        return data.custom.toLowerCase().includes(this.selected.toLowerCase());
      })
      .map((data) => {
        return data.MissionId;
      });

    // this.blackBoxListArr = this.blackBoxListArr.filter((data) => {
    //   return fileteredArr.includes(data.MissionId);
    // });
    this.paginationArray[this.indexing] = this.paginationArray[
      this.indexing
    ].filter((data) => {
      return fileteredArr.includes(data.MissionId);
    });
  }

  //pagination
  //next button
  getNext() {
    if (this.paginationKey) {
      //incrementing the array
      this.indexing = this.indexing + 1;

      //if next page data is not present in the array
      if (!this.pageArray.includes(this.indexing)) {
        //profile data
        // let decrypt = CryptoJS.AES.decrypt(
        //   localStorage.getItem('UserDetails').toString(),
        //   environment.operatorKey
        // );
        // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
        this.profileDetails = this.operatorService.returnProfileDetails();
        this.loader = true;
        let payload = {
          OperatorId: this.profileDetails.UserId,
          Time: this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(),
            'fulldateAndTimeZ'
          ),
          PaginationKey: this.paginationKey,
        };
        //api call
        this.operatorApi.getBlackBoxList(payload).then(
          (res) => {
            //saving the index
            this.pageArray.push(this.indexing);
            //if we reach to last page then there will be no PaginationKey
            this.paginationKey = res['data'].MainData.PaginationKey;
            let arr = [];
            this.loader = false;
            this.blackBoxListArr = res['data'].MainData.MissionList;

            if (this.blackBoxListArr.length != 0) {
              // adding the new array as element on existing paginationArray
              this.paginationArray.push(this.blackBoxListArr);
              //search functionality sets up
              this.paginationArray[this.indexing].map((val) => {
                arr.push({
                  MissionId: val.MissionId,
                  OperatorId: val.OperatorId,
                  CreatedByName: val.CreatedByName,
                  custom:
                    val.MissionId +
                    ', ' +
                    val.OperatorId +
                    ', ' +
                    val.CreatedByName,
                });
              });
              this.missionSearchBy = arr;
              this.rawData = this.paginationArray[this.indexing];
            }
          },
          (err) => {
            this.loader = false;
          }
        );
      }
      //if next page data is available
      else {
        //search functionality sets up
        let arr = [];
        this.paginationArray[this.indexing].map((val) => {
          arr.push({
            MissionId: val.MissionId,
            OperatorId: val.OperatorId,
            CreatedByName: val.CreatedByName,
            custom:
              val.MissionId + ', ' + val.OperatorId + ', ' + val.CreatedByName,
          });
        });
        this.missionSearchBy = arr;
        this.rawData = this.paginationArray[this.indexing];
      }
    } else {
      //paginationKey is not available
      //if next page data is available
      //search functionality sets up
      //incrementing the array
      this.indexing = this.indexing + 1;
      if (this.pageArray.includes(this.indexing)) {
        let arr = [];
        this.paginationArray[this.indexing].map((val) => {
          arr.push({
            MissionId: val.MissionId,
            OperatorId: val.OperatorId,
            CreatedByName: val.CreatedByName,
            custom:
              val.MissionId + ', ' + val.OperatorId + ', ' + val.CreatedByName,
          });
        });
        this.missionSearchBy = arr;
        this.rawData = this.paginationArray[this.indexing];
      }
    }
  }

  //previous button
  getPrevious() {
    if (this.indexing != 0 && this.indexing > -1) {
      this.indexing = this.indexing - 1;
      //search functionality sets up
      let arr = [];
      this.paginationArray[this.indexing].map((val) => {
        arr.push({
          MissionId: val.MissionId,
          OperatorId: val.OperatorId,
          CreatedByName: val.CreatedByName,
          custom:
            val.MissionId + ', ' + val.OperatorId + ', ' + val.CreatedByName,
        });
      });
      this.missionSearchBy = arr;
      this.rawData = this.paginationArray[this.indexing];
    }
  }
  //trackBy function for mission list
  trackByPaginationArray(index: number, blackBoxList: any): string {
    return blackBoxList.MissionId;
  }
}
