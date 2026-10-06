import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { AuthorityApplicationComponent } from '../../authority-application.component';

@Component({
  selector: 'app-blackbox-list',
  templateUrl: './blackbox-list.component.html',
  styleUrls: ['./blackbox-list.component.scss'],
})
export class BlackboxListComponent implements OnInit {
  profileDetails;

  @Input() blackBoxIndex;
  @Output() blackBoxIndexChange = new EventEmitter<string>();
  @Input() operatorId;
  @Output() operatorIdChange = new EventEmitter<string>();
  @Input() missionId;
  @Output() missionIdChange = new EventEmitter<string>();
  @Input() missionStatus;
  @Output() missionStatusChange = new EventEmitter<string>();

  blackBoxListArr;

  //Loader;
  loader = false;
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
  flag_FileteredData_Or_BlackBoxList;

  constructor(
    private authorityApi: AuthorityapisService,
    private activeRoute: ActivatedRoute,
    private dateAndTimeFormat: DateTimeFormatService,
    private router: Router,
    private authorityApplicationComponent: AuthorityApplicationComponent
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }

  //Contain those functionality needed at first run of this component
  initialFunction() {
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('AdminDetails').toString(),
    //   environment.authorityKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.authorityApplicationComponent.getDecryptData();

    if (this.activeRoute.snapshot.paramMap.get('metric')) {
      //to enable tbody for getBlackBoxFileteredData
      this.flag_FileteredData_Or_BlackBoxList = true;
      let encryptedData = decodeURI(
        this.activeRoute.snapshot.paramMap.get('metric')
      );
      let decryptedMetric = JSON.parse(atob(encryptedData));
      this.getBlackBoxFileteredData(decryptedMetric);
    } else {
      //to enable tbody for getBlackBoxList
      this.flag_FileteredData_Or_BlackBoxList = false;
      this.getBlackBoxList();
    }
  }
  // Get missions list
  getBlackBoxList() {
    this.loader = true;
    let payload = {
      Time: this.dateAndTimeFormat.dateAndTimeFormatting(
        new Date(),
        'fulldateAndTimeZ'
      ),
      CountryCode: this.profileDetails.Country,
      Role: this.profileDetails.Role,
      UserId: this.profileDetails.UserId,
    };
    this.authorityApi.getBlackBoxList(payload).then(
      (res) => {
        this.indexing = 0;
        this.pageArray.push(this.indexing);
        this.paginationKey = res['data'].MainData.PaginationKey;
        let arr = [];
        this.loader = false;
        this.blackBoxListArr = res['data'].MainData.MissionList;
        if (this.blackBoxListArr.length != 0) {
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
  }
  //Filtering
  getBlackBoxFileteredData(metric) {
    this.loader = true;
    let statusArr = [
      {
        Status: 'Approved',
        Parameter: 'ApprovedMissions',
      },
      {
        Status: 'Pending',
        Parameter: 'PendingMissions',
      },
      {
        Status: 'Rejected',
        Parameter: 'DeclinedMissions',
      },
      {
        Status: 'Completed',
        Parameter: 'SuccessfulMissions',
      },
      {
        Status: 'Reported',
        Parameter: 'ReportedMissions',
      },
    ];
    let status = statusArr.find((val) => {
      return val.Parameter == metric.Parameter;
    });
    if (status) {
      let payload = {
        Days: metric.Days,
        Status: status.Status,
      };
      this.authorityApi.getBlackBoxFileteredData(payload).then(
        (res) => {
          let arr = [];
          this.loader = false;
          this.blackBoxListArr = res['data']?.MainData.MissionList;
          this.rawData = this.blackBoxListArr;
          if (this.blackBoxListArr.length != 0) {
            this.blackBoxListArr.map((val) => {
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
          }
        },
        (err) => {
          this.loader = false;
        }
      );
    } else {
      this.getBlackBoxList();
    }
  }

  encrypt(event) {
    let encrydata = CryptoJS.AES.encrypt(
      JSON.stringify(event),
      environment.authorityKey
    );
    let encryData = encrydata.toString();
    return encryData;
  }
  //Open blackbox detail screen
  onBlackBoxDetail(MissionId, operatorId, status) {
    MissionId = this.encrypt(MissionId);
    this.router.navigate([
      'authority/authority-app/blackbox/missionlist',
      MissionId,
    ]);
    // this.blackBoxIndex = 1;
    // this.blackBoxIndexChange.emit(this.blackBoxIndex);
    // this.operatorIdChange.emit(operatorId);

    // this.missionId = MissionId;
    // this.missionIdChange.emit(this.missionId);

    // this.missionStatus = status;
    // this.missionStatusChange.emit(this.missionStatus);
  }

  //Search
  searchByOnSelect(e) {
    this.searchByFlag = true;
    this.blackBoxListArr = this.rawData;
    this.paginationArray[this.indexing] = this.rawData;
    this.paginationArray[this.indexing] = this.paginationArray[
      this.indexing
    ].filter((data) => {
      return data.MissionId == e.item.MissionId ? data : null;
    });
    //  let filteredBlackboxDetail = this.blackBoxListArr.filter((data) => {
    //   return data.MissionId == e.item.MissionId ? data : null;
    // });
    // if (filteredBlackboxDetail && filteredBlackboxDetail.length != 0) {
    //   this.searchByFlag = true;
    //   this.blackBoxListArr = filteredBlackboxDetail;
    // } else {
    //   this.clearSearch();
    // }
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
    this.paginationArray[this.indexing] = this.paginationArray[
      this.indexing
    ].filter((data) => {
      return fileteredArr.includes(data.MissionId);
    });
    // let filteredBlackboxDetail = this.blackBoxListArr.filter((data) => {
    //   return fileteredArr.includes(data.MissionId);
    // });
    // if (filteredBlackboxDetail && filteredBlackboxDetail.length != 0) {
    //   this.searchByFlag = true;
    //   this.blackBoxListArr = filteredBlackboxDetail;
    // } else {
    //   this.clearSearch();
    // }
  }

  //pagination
  //next button
  getNext() {
    if (this.paginationKey) {
      //incrementing the array
      this.indexing = this.indexing + 1;
      //if next page data is not present in the array
      if (!this.pageArray.includes(this.indexing)) {
        this.loader = true;
        let payload = {
          Time: this.dateAndTimeFormat.dateAndTimeFormatting(
            new Date(),
            'fulldateAndTimeZ'
          ),
          CountryCode: this.profileDetails.Country,
          UserId: this.profileDetails.UserId,
          Role: this.profileDetails.Role,
          PaginationKey: this.paginationKey,
        };
        //api call
        this.authorityApi.getBlackBoxList(payload).then(
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
      //when no pagination key is there
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
  //trackBy function for mission list comes from dashboard
  trackByblackBoxListArr(index: number, blackBoxList: any): string {
    return blackBoxList.MissionId;
  }
}
