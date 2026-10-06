import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { Constants } from 'src/app/constants/constants';
import Swal from 'sweetalert2';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
@Component({
  selector: 'app-drones-gears-list',
  templateUrl: './drones-gears-list.component.html',
  styleUrls: ['./drones-gears-list.component.scss'],
  })
export class DronesGearsListComponent implements OnInit, OnDestroy {
  //image dropdown for edit
  categories = [
    {
      value: 'edit',
      viewValue: 'Edit',
      image: '../../../../../assets/common-layout/Edit.svg',
    },
    {
      value: 'delete',
      viewValue: 'Delete',
      image: '../../../../../assets/common-layout/Delete.svg',
    },
  ];

  //Profile Details
  profileDetails;

  //Loader
  loader;

  //Drones List;
  dronesList;
  whatsApp_DronesList = [];

  //Viewing Single Drone detail
  droneDetail;

  droneFrontImageFileName;
  droneSideImageFileName;
  droneIsometricImageFileName;

  //Drones units List
  DroneUnits = {};
  DroneData: any;
  //'get-drones-gears-list' API Subscritption
  private unSubscribe = new Subject<void>();

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      //  text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });

  // Alert/Confirmation and Pop-up  methods
  showSwal(type, UserId) {
    if (type == 'Are you sure you want to delete this Drone?') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'warning',
          background: '#1b1f27',
          title: `Are you sure you want to delete this Drone?`,
          text: `This action cannot be undone.`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.onDroneDelete(UserId);
          }
          if (result.isDismissed) {
            // console.log("denied")
          }
        });
    }
    if (type == 'Drone deleted successfully') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Drone deleted successfully`,
          // text:`Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            // this.initialFunction();
            //Method to intialize the getDronesAndGearsList service
            this.getDronesListApi();
          }
        });
    }
    if (type == 'WhatsApp list cannot have more than 3 drone.') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'info',
          background: '#1b1f27',
          // title: `WhatsApp drone list cannot have more than 3 drone.`,
          text: `WhatsApp drone list cannot have more than 3 drone.`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    }
    if (type == 'WhatsApp list must have atleast one drone.') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'info',
          background: '#1b1f27',
          // title: `WhatsApp Drone list should have m than 3 drone.`,
          text: `WhatsApp drone list must have atleast one drone.`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    }
    if (type == 'Drone list must have atleast one drone.') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'info',
          background: '#1b1f27',
          // title: `WhatsApp Drone list should have m than 3 drone.`,
          text: `Drone list must have atleast one drone.`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    }
    if (type == 'This drone is already present in this section.') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'info',
          background: '#1b1f27',
          // title: `WhatsApp Drone list should have m than 3 drone.`,
          text: `This drone is already present in WhatsApp section.`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
          }
        });
    }
  }
  constructor(
    private router: Router,
    private operatorApi: OperatorapisService,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }

  //Contain those functionality needed at first run of this component
  initialFunction() {
    this.DroneUnits = Constants.DroneUnits;
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();
    //Method to get Drones data from service
    this.getDronesList();
  }

  //Method to get Drones data from service
  getDronesList() {
    this.loader = true;
    //this was the previous method to call an getDronesAndGearsList API
    // let payload = {
    //   OperatorId: this.profileDetails.UserId,
    // };
    // this.operatorApi.getDronesAndGearsList(payload).then(
    //   (res: any) => {
    //     console.log(res);
    //     this.dronesList = res.data.MainData['DronesAndGears'];
    //     //adding one default drone to whatsapp drone
    //     this.whatsApp_DronesList = res.data.MainData['WhatsappDrone'];
    //     if (this.whatsApp_DronesList.length == 0) {
    //       this.whatsApp_DronesList.push(this.dronesList[0]);
    //     }
    //     this.loader = false;
    //   },
    //   (err) => {
    //     this.loader = false;
    //   }
    // );
    this.operatorApi.dronesAndGearsData$
      .pipe(takeUntil(this.unSubscribe))
      .subscribe((res) => {
        if (res !== null) {
          this.dronesList = res?.data?.MainData['DronesAndGears'];
          //adding one default drone to whatsapp drone list
          this.whatsApp_DronesList = res?.data?.MainData['WhatsappDrone'];
          if (
            this.whatsApp_DronesList.length == 0 &&
            this.dronesList.length !== 0
          ) {
            this.whatsApp_DronesList.push(this.dronesList[0]);
            this.onWhatsApp_DronesLIstChange('assign');
          }
          this.loader = false;
        }
        // console.log("subscribe from drone and gear list component: ", res)
      });
  }

  //Method to intialize the getDronesAndGearsList service
  getDronesListApi() {
    this.loader = true;
    let payload = {
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
      // console.log('intialize from get drone and gears list',res);
      this.dronesList = res.data.MainData['DronesAndGears'];
      //adding one default drone to whatsapp drone
      this.whatsApp_DronesList = res.data.MainData['WhatsappDrone'];
      if (this.whatsApp_DronesList.length == 0 && this.dronesList.length !== 0) {
        this.whatsApp_DronesList.push(this.dronesList[0]);
      }
      this.loader = false;
    });
  }

  //ON click of Add new Drone button
  onAddDronesGearClick() {
    this.router.navigateByUrl(
      'operator/operator-app/drones-gears/registration'
    );
  }
  //Side Drawer
  onOpenDrawer(drone, drawer) {
    let hasFrontImage = drone?.DroneImages?.some((img) => img.Type === 'front');
    hasFrontImage
      ? (this.droneFrontImageFileName = 'Uploaded')
      : (this.droneFrontImageFileName = 'Not Uploaded');
    let hasSideImage = drone?.DroneImages?.some((img) => img.Type === 'side');
    hasSideImage
      ? (this.droneSideImageFileName = 'Uploaded')
      : (this.droneSideImageFileName = 'Not Uploaded');
    let hasIsometricImage = drone?.DroneImages?.some(
      (img) => img.Type === 'isometric'
    );
    hasIsometricImage
      ? (this.droneIsometricImageFileName = 'Uploaded')
      : (this.droneIsometricImageFileName = 'Not Uploaded');
    this.droneDetail = drone;
    this.droneDetail?.UAVMakeInfoCertificate === true
      ? (this.droneDetail['UAVMakeInfoCertificate'] = 'Yes')
      : (this.droneDetail['UAVMakeInfoCertificate'] = 'No');
    drawer.toggle();
  }
  //On click of CopyID button
  copyMessage(val: string, drawer: any) {
    if (drawer !== 'do_not_toggle') {
      drawer.toggle();
    }
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
  //On click of edit dropdown
  onSelect(selection: any, data: any) {
    if (selection == 'edit') {
      this.router.navigateByUrl(
        `operator/operator-app/drones-gears/registration/${data.DroneId}`
      );
    }
    if (selection == 'delete') {
      this.showSwal(
        'Are you sure you want to delete this Drone?',
        data.DroneId
      );
    }
  }
  trackByDroneId(index: number, drone: any): string {
    return drone.DroneId;
  }

  //drag and drop
  onDrop(event: CdkDragDrop<string[]>) {
    // if to move iteam is in the same list
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    //to transfer into another array
    else {
      if (
        event.previousContainer.id === 'dronesListId' &&
        this.whatsApp_DronesList.length >= 3
      ) {
        this.showSwal('WhatsApp list cannot have more than 3 drone.', null);
      } else if (
        event.previousContainer.id === 'dronesListId' &&
        this.dronesList.length <= 1
      ) {
        this.showSwal('Drone list must have atleast one drone.', null);
      } else if (
        event.previousContainer.id === 'whatsApp_DronesListId' &&
        this.whatsApp_DronesList.length <= 1
      ) {
        this.showSwal('WhatsApp list must have atleast one drone.', null);
      } else {
        //to transfer into another array , draging out from whats_app_drone_list or hitting the assign list
        if (event.previousContainer.id === 'whatsApp_DronesListId') {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.onWhatsApp_DronesLIstChange('unassign');
        }
        // draging in whats_app_drone_list or hitting the assign API
        else {
          //checking weather the drone is already presnet or not in whatsaap section
          //  console.log("moved card", event.previousContainer.data[event.previousIndex])
          let movedCard = event.previousContainer.data[event.previousIndex];
          let dronePresentAlready = this.whatsApp_DronesList.find(
            (elem) => elem.DroneId == movedCard['DroneId']
          );
          //If the drone is already present, can't move the drone card
          if (dronePresentAlready) {
            this.showSwal(
              'This drone is already present in this section.',
              null
            );
          }
          // if the drone already not present in the whatsAap section then move the card
          else {
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
            this.onWhatsApp_DronesLIstChange('assign');
          }
        }
      }
    }
  }

  onDroneDelete(droneId) {
    this.loader = true;
    let payload = {
      DroneId: droneId,
    };
    this.operatorApi.droneDelete(payload).then(
      (res) => {
        this.loader = false;
        //Confirmation msg
        if (res['data']?.MainData == 'Drone deleted successfully') {
          this.showSwal('Drone deleted successfully', null);
        }
      },
      (err) => {}
    );
  }

  onWhatsApp_DronesLIstChange(apiName) {
    let payload = [];
    this.whatsApp_DronesList.forEach((val) => {
      let obj = {
        DroneId: val?.DroneId,
      };
      payload.push(obj);
    });
    let payload2 = {
      DroneList: payload,
    };
    //if api need to be called assign
    if (apiName == 'assign') {
      this.operatorApi.whatsAppDroneListAssign(payload2).then(
        (res) => {
        //calling API for update
        this.onDragAndDropAPIUpadte()
        },
        (err) => {}
      );
    }
    //if api need to be called unassign
    else if (apiName == 'unassign') {
      this.operatorApi.whatsAppDroneListUnassign(payload2).then(
        (res) => {
          //calling API for update
          this.onDragAndDropAPIUpadte()
        },
        (err) => {}
      );
    }
  }

  onDragAndDropAPIUpadte(){
            let payload = {
              OperatorId: this.profileDetails.UserId,
            };
            this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
              // console.log('intialize from get drone and gears list',res);
              this.dronesList = res.data.MainData['DronesAndGears'];
              //adding one default drone to whatsapp drone
              this.whatsApp_DronesList = res.data.MainData['WhatsappDrone'];
              if (this.whatsApp_DronesList.length == 0 && this.dronesList.length !== 0) {
                this.whatsApp_DronesList.push(this.dronesList[0]);
              }
            });
  }
  
  ngOnDestroy(): void {}
}
