import {
  Component,
  OnInit,
  AfterContentInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { ActivatedRoute } from '@angular/router';
import { SwaltsFile } from '../../Swal';
import { Subject } from 'rxjs';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
@Component({
  selector: 'app-drone-gears-registration',
  templateUrl: './drone-gears-registration.component.html',
  styleUrls: ['./drone-gears-registration.component.scss'],
})
export class DroneGearsRegistrationComponent
  implements OnInit, AfterContentInit
{
  //Loader
  loader;

  //Profile Details
  profileDetails;

  //Form Fields
  droneRegisterForm: FormGroup;
  //Separate form Groups
  // uavInfo: FormGroup;
  // uavMakeInfo: FormGroup;
  // avionics: FormGroup;
  // comms: FormGroup;
  //Form field dropdown Inputs

  //submitted
  submitted = false;

  //params value
  paramValue;

  //Form dropdown Inputs
  // formType = [
  //   'Multirotor', 'Helicopter', 'Hybrid VTOL', 'Fixedwing'
  // ]
  // formClassWeight = [
  //   'Nano (< 250g)', 'micro (250-2 kg)', 'small (2-25 kg)', 'med (25-150kg)', 'large (>150 kg)'
  // ]
  // formGPSType = [
  //   'PPK', 'RTK'
  // ]
  // formManufacturer = [
  //   'EndureAir', 'TAS', 'Ideaforge', 'E-plane company', 'Self-made'
  // ]
  // formFlightController = [
  //   'Pixhawk', 'Naza', 'APM', 'Other'
  // ]
  // formGCS = [
  //   'QGC', 'Mission Planner', 'Other'
  // ]
  // formProtocol = [
  //   'Mavlink', 'DJI Protocol'
  // ]
  // formCommsType = [
  //   'RF', 'LTE', 'Both'
  // ]

  //Drone Parameters
  droneParameters;

  //dropdown array
  typeArr = [];
  classArr = [];
  gpsTypeArr = [];
  infoManufacturerArr = [];
  flightControllerArr = [];
  avionicsProtocolArr = [];
  avionicsGcsArr = [];
  commsTypeArr = [];

  //payload
  payload = {};

  //Drone list
  dronesList;
  modelName;
  addEditFlag;
  matchedDrone;
  discardFlag;

  //drone image upload
  droneImagesArr = [];
  droneFrontImageFlag;
  droneSideImageFlag;
  droneIsometricImageFlag;

  //Error Messages
  droneFrontImageFileSizeError = false;
  droneFrontImageFileTypeError = false;
  droneFrontImageFileName;
  droneSideImageFileSizeError = false;
  droneSideImageFileTypeError = false;
  droneSideImageFileName;
  droneIsometricImageFileSizeError = false;
  droneIsometricImageFileTypeError = false;
  droneIsometricImageFileName;

  //'get-drones-gears-list' API Subscritption
  private unSubscribe = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private operatorApi: OperatorapisService,
    private swal: SwaltsFile,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    //geting the params value for edit section
    this.paramValue = this.route.snapshot.paramMap.get('droneId');
    this.addEditFlag = false;
    this.initialFunction();

    // if (this.paramValue !== null && this.paramValue !== undefined && this.paramValue !== "") {
    // this.addEditFlag =true;
    //gets drone list
    // this.getDronesList();
    // }

    //documents fields
    this.droneFrontImageFlag = 0;
    this.droneSideImageFlag = 0;
    this.droneIsometricImageFlag = 0;
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  //Initial Function
  initialFunction() {
    //Building Form
    this.droneRegisterForm = this.fb.group({
      uavInfo: this.fb.group({
        model: [
          '',
          [
            Validators.required,
            this.noWhitespaceValidator,
            Validators.minLength(3),
          ],
        ],
        uinNumber: ['', [Validators.required]],
        // , Validators.pattern("^([U]+([0-9]{7}$))")
        type: ['', Validators.required],
        class: ['', Validators.required],
        endurance: [
          '',
          [Validators.required, Validators.pattern('^[0-9]+(?:.[0-9]+)?$')],
        ],
        maxSpeed: [
          '',
          [Validators.required, Validators.pattern('^[0-9]+(?:.[0-9]+)?$')],
        ],
        // gpsManufacturer: ['', Validators.required],
        // gpsModel: ['', Validators.required],
        gpsManufacturer: [''],
        gpsModel: [''],
        gpsType: ['', Validators.required],
      }),
      uavMakeInfo: this.fb.group({
        manufacturer: ['', Validators.required],
        maxDimension: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?:[0-9]+(?:.[0-9]*$)?)?$'),
          ],
        ],
        certificate: ['', Validators.required],
      }),
      avionics: this.fb.group({
        flightController: ['', Validators.required],
        gcs: ['', Validators.required],
        protocol: ['', Validators.required],
      }),
      comms: this.fb.group({
        commsType: ['', Validators.required],
        // '^[0-9]*$'
        commsRange: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?:[0-9]+(?:.[0-9]*$)?)?$'),
          ],
        ],
        commsMake: ['', Validators.required],
      }),
      droneImage: this.fb.group({
        droneFrontImageFile: ['', Validators.required],
        droneFrontImageFileType: ['', Validators.required],
        droneSideImageFile: [''],
        droneSideImageFileType: [''],
        droneIsometricImageFile: [''],
        droneIsometricImageFileType: [''],
      }),
    });
    // this.uavInfo = this.droneRegisterForm.get('uavInfo') as FormGroup;
    // this.uavMakeInfo = this.droneRegisterForm.get('uavMakeInfo') as FormGroup;
    // this.avionics = this.droneRegisterForm.get('avionics') as FormGroup;
    // this.comms = this.droneRegisterForm.get('comms') as FormGroup;
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );
    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();
    this.getDroneParamter();
  }
  //Method to get input parameters
  getDroneParamter() {
    this.loader = true;
    //API request to get parameters
    this.operatorApi.getDroneParameters().then(
      (res) => {
        this.loader = false;
        this.droneParameters = res['data']?.MainData;
        //Calling reuseable method
        this.dropdownFormer('uav-info-type');
        this.dropdownFormer('uav-info-class');
        this.dropdownFormer('uav-info-gps-type');
        this.dropdownFormer('uav-make-info-manufacturer');
        this.dropdownFormer('avionics-flight-controller');
        this.dropdownFormer('avionics-gcs');
        this.dropdownFormer('avionics-protocol');
        this.dropdownFormer('comms-type');
      },
      (err) => {
        this.loader = false;
      }
    );
  }
  //Sagregating the dyanamic values for dropdown
  dropdownFormer(key: any) {
    this.droneParameters[key].forEach((element) => {
      if (key === 'uav-info-type') {
        this.typeArr.push(element.Value);
      }
      if (key === 'uav-info-class') {
        this.classArr.push(element.Value);
      }
      if (key === 'uav-info-gps-type') {
        this.gpsTypeArr.push(element.Value);
      }
      if (key === 'uav-make-info-manufacturer') {
        this.infoManufacturerArr.push(element.Value);
      }
      if (key === 'avionics-flight-controller') {
        this.flightControllerArr.push(element.Value);
      }
      if (key === 'avionics-gcs') {
        this.avionicsGcsArr.push(element.Value);
      }
      if (key === 'avionics-protocol') {
        this.avionicsProtocolArr.push(element.Value);
      }
      if (key === 'comms-type') {
        this.commsTypeArr.push(element.Value);
      }
    });
  }
  ngAfterContentInit() {
    //Edit drone and gear sections
    if (
      this.paramValue !== null &&
      this.paramValue !== undefined &&
      this.paramValue !== ''
    ) {
      this.addEditFlag = true;
      // this.loader =  true;
      let payload = {
        OperatorId: this.profileDetails.UserId,
      };
      //API to get Drone data
      // this.operatorApi.getDronesAndGearsList(payload).then(
      //above API call are used as service now
      this.operatorApi.dronesAndGearsData$
        .pipe(takeUntil(this.unSubscribe))
        .subscribe(
          (res) => {
            // console.log("calling an subscription from edit drone and gear section",res)
            if (res !== null) {
              this.dronesList = res?.['data']?.MainData['DronesAndGears'];
              this.matchedDrone = this.dronesList.find(
                (elem) => elem.DroneId == this.paramValue
              );
              //if we are editing the drone just after dragging the drone to whatsaap list, So by drag and drop the drone gets removed from main
              //drone list autometically by styling , so we are checking it from whatsaap list.
              if (this.matchedDrone == undefined) {
                this.dronesList = res?.data?.MainData['WhatsappDrone'];
                this.matchedDrone = this.dronesList.find(
                  (elem) => elem.DroneId == this.paramValue
                );
              }
              this.modelName = this.matchedDrone?.Model;
              //Pre-filled values in form
              if (
                this.matchedDrone != null &&
                this.matchedDrone !== undefined
              ) {
                if (
                  this.matchedDrone?.DroneImages &&
                  this.matchedDrone?.DroneImages.length > 0
                ) {
                  this.matchedDrone?.DroneImages.forEach((image) => {
                    if (image.Type == 'front') {
                      this.droneFrontImageFileName = 'Already Uploaded';
                      this.droneFrontImageFlag = 1;
                      this.droneRegisterForm.get('droneImage').patchValue({
                        // droneFrontImageFile : image.DroneImage,
                        droneFrontImageFile: 'URL_PRESENT',
                        droneFrontImageFileType: image.FormatType,
                      });
                    }
                    if (image.Type == 'side') {
                      this.droneSideImageFileName = 'Already Uploaded';
                      this.droneSideImageFlag = 1;
                      this.droneRegisterForm.get('droneImage').patchValue({
                        // droneSideImageFile : image.DroneImage,
                        droneSideImageFile: 'URL_PRESENT',
                        droneSideImageFileType: image.FormatType,
                      });
                    }
                    if (image.Type == 'isometric') {
                      this.droneIsometricImageFileName = 'Already Uploaded';
                      this.droneIsometricImageFlag = 1;
                      this.droneRegisterForm.get('droneImage').patchValue({
                        // droneIsometricImageFile : image.DroneImage,
                        droneIsometricImageFile: 'URL_PRESENT',
                        droneIsometricImageFileType: image.FormatType,
                      });
                    }
                  });
                }
                this.droneRegisterForm.get('uavInfo').patchValue({
                  model: this.matchedDrone?.Model,
                  uinNumber: this.matchedDrone?.UIN,
                  type: this.matchedDrone?.UAVInfoType.Value,
                  class: this.matchedDrone?.UAVInfoClass.Value,
                  endurance: this.matchedDrone?.Endurance,
                  maxSpeed: this.matchedDrone?.MaximumSpeed,
                  gpsManufacturer: this.matchedDrone?.GPSManufacturer,
                  gpsModel: this.matchedDrone?.GPSmodel,
                  gpsType: this.matchedDrone?.UAVInfoGPSType.Value,
                });
                // this.droneRegisterForm.get('uavInfo.type').setValue(this.matchedDrone.UAVInfoType);
                this.droneRegisterForm.get('uavMakeInfo').patchValue({
                  manufacturer:
                    this.matchedDrone?.UAVMakeInfoManufacturer.Value,
                  maxDimension: this.matchedDrone?.Maxdimension,
                  certificate:
                    this.matchedDrone?.UAVMakeInfoCertificate == true
                      ? 'true'
                      : 'false',
                });
                this.droneRegisterForm.get('avionics').patchValue({
                  flightController:
                    this.matchedDrone?.AvionicsFlightController.Value,
                  gcs: this.matchedDrone?.AvionicsGCS.Value,
                  protocol: this.matchedDrone?.AvionicsProtocol.Value,
                });
                this.droneRegisterForm.get('comms').patchValue({
                  commsType: this.matchedDrone?.CommsType.Value,
                  commsRange: this.matchedDrone?.CommsRange,
                  commsMake: this.matchedDrone?.CommsMake,
                });
                // this.loader =  false;
              }
            }
          },
          (err) => {}
        );
    }
  }
  onChange(e) {}
  // Method to handle payload changes
  payloadFormer(key: any) {
    this.droneParameters[key].forEach((element) => {
      if (key === 'uav-info-type') {
        if (element.Value === this.droneRegisterForm.value.uavInfo.type) {
          this.payload['UAVInfoType'] = element;
        }
      }
      if (key === 'uav-info-class') {
        if (element.Value === this.droneRegisterForm.value.uavInfo.class) {
          this.payload['UAVInfoClass'] = element;
        }
      }
      if (key === 'uav-info-gps-type') {
        if (element.Value === this.droneRegisterForm.value.uavInfo.gpsType) {
          this.payload['UAVInfoGPSType'] = element;
        }
      }
      if (key === 'uav-make-info-manufacturer') {
        if (
          element.Value ===
          this.droneRegisterForm.value.uavMakeInfo.manufacturer
        ) {
          this.payload['UAVMakeInfoManufacturer'] = element;
        }
      }
      if (key === 'avionics-flight-controller') {
        if (
          element.Value ===
          this.droneRegisterForm.value.avionics.flightController
        ) {
          this.payload['AvionicsFlightController'] = element;
        }
      }
      if (key === 'avionics-gcs') {
        if (element.Value === this.droneRegisterForm.value.avionics.gcs) {
          this.payload['AvionicsGCS'] = element;
        }
      }
      if (key === 'avionics-protocol') {
        if (element.Value === this.droneRegisterForm.value.avionics.protocol) {
          this.payload['AvionicsProtocol'] = element;
        }
      }
      if (key === 'comms-type') {
        if (element.Value === this.droneRegisterForm.value.comms.commsType) {
          this.payload['CommsType'] = element;
        }
      }
    });
  }
  //to form drone images payload
  droneImagesPayloadFormer() {
    function objFrom(image, fileType, imageType) {
      return {
        DroneImage: image,
        Type: imageType,
        FormatType: fileType,
      };
    }
    if (
      this.droneRegisterForm.value.droneImage?.droneFrontImageFile != null &&
      this.droneRegisterForm.value.droneImage?.droneFrontImageFile.length !=
        0 &&
      this.droneRegisterForm.value.droneImage?.droneFrontImageFile !==
        'URL_PRESENT'
    ) {
      let obj = objFrom(
        this.droneRegisterForm.value.droneImage.droneFrontImageFile,
        this.droneRegisterForm.value.droneImage.droneFrontImageFileType,
        'front'
      );
      this.droneImagesArr.push(obj);
    }
    if (
      this.droneRegisterForm.value.droneImage?.droneSideImageFile != null &&
      this.droneRegisterForm.value.droneImage?.droneSideImageFile.length != 0 &&
      this.droneRegisterForm.value.droneImage?.droneSideImageFile !==
        'URL_PRESENT'
    ) {
      let obj = objFrom(
        this.droneRegisterForm.value.droneImage.droneSideImageFile,
        this.droneRegisterForm.value.droneImage.droneSideImageFileType,
        'side'
      );
      this.droneImagesArr.push(obj);
    }
    if (
      this.droneRegisterForm.value.droneImage?.droneIsometricImageFile !=
        null &&
      this.droneRegisterForm.value.droneImage?.droneIsometricImageFile.length !=
        0 &&
      this.droneRegisterForm.value.droneImage?.droneIsometricImageFile !==
        'URL_PRESENT'
    ) {
      let obj = objFrom(
        this.droneRegisterForm.value.droneImage.droneIsometricImageFile,
        this.droneRegisterForm.value.droneImage.droneIsometricImageFileType,
        'isometric'
      );
      this.droneImagesArr.push(obj);
    }
  }
  //On click of Confirm button
  onDroneRegistration() {
    this.submitted = true;
    if (this.droneRegisterForm.valid) {
      // let payload = {
      //   ...this.droneRegisterForm.value.uavInfo,
      //   ...this.droneRegisterForm.value.uavMakeInfo,
      //   ...this.droneRegisterForm.value.avionics,
      //   ...this.droneRegisterForm.value.comms,
      // }
      //called to from drone images payload
      this.droneImagesPayloadFormer();
      this.payload = {
        OperatorId: this.profileDetails.UserId,
        Model: this.droneRegisterForm.value.uavInfo.model,
        UIN: this.droneRegisterForm.value.uavInfo.uinNumber.toUpperCase(),
        // UAVInfoType: this.droneRegisterForm.value.uavInfo.type,
        // UAVInfoClass: this.droneRegisterForm.value.uavInfo.class,
        Endurance: this.droneRegisterForm.value.uavInfo.endurance,
        MaximumSpeed: this.droneRegisterForm.value.uavInfo.maxSpeed,
        GPSManufacturer: this.droneRegisterForm.value.uavInfo.gpsManufacturer,
        GPSmodel: this.droneRegisterForm.value.uavInfo.gpsModel,
        // UAVInfoGPSType: this.droneRegisterForm.value.uavInfo.gpsType,
        // UAVMakeInfoManufacturer: this.droneRegisterForm.value.uavMakeInfo.manufacturer,
        Maxdimension: this.droneRegisterForm.value.uavMakeInfo.maxDimension,
        // AvionicsFlightController: this.droneRegisterForm.value.avionics.flightController,
        // AvionicsGCS: this.droneRegisterForm.value.avionics.gcs,
        // AvionicsProtocol: this.droneRegisterForm.value.avionics.protocol,
        // CommsType: this.droneRegisterForm.value.comms.commsType,
        CommsRange: this.droneRegisterForm.value.comms.commsRange,
        CommsMake: this.droneRegisterForm.value.comms.commsMake,
        UAVMakeInfoCertificate:
          this.droneRegisterForm.value.uavMakeInfo.certificate,
        DroneImages: this.droneImagesArr,
      };
      this.droneRegisterForm.value.uavMakeInfo.certificate === 'true'
        ? (this.payload['UAVMakeInfoCertificate'] = true)
        : (this.payload['UAVMakeInfoCertificate'] = false);
      this.payloadFormer('uav-info-type');
      this.payloadFormer('uav-info-class');
      this.payloadFormer('uav-info-gps-type');
      this.payloadFormer('uav-make-info-manufacturer');
      this.payloadFormer('avionics-flight-controller');
      this.payloadFormer('avionics-gcs');
      this.payloadFormer('avionics-protocol');
      this.payloadFormer('comms-type');
      this.loader = true;
      //API request to register a drone
      this.operatorApi.droneRegistration(this.payload).then(
        (res) => {
          this.loader = false;
          this.droneImagesArr = [];
          //Method to intialize the getDronesAndGearsList service
          this.getDronesListApi();
          //Confirmation msg
          this.swal.showSwal('droneRegistrationSuccess');
        },
        (err) => {}
      );
    }
  }
  //On click of back button
  backButton() {
    this.router.navigateByUrl('operator/operator-app/drones-gears/list');
  }
  //On click of cancel button
  onDroneRegCancel() {
    // this.droneRegisterForm.reset();
    this.router.navigateByUrl('operator/operator-app/drones-gears/list');
  }
  //getters of form
  get uavInfo() {
    let uavInfo = this.droneRegisterForm.get('uavInfo') as FormGroup;
    return uavInfo.controls;
  }
  get uavMakeInfo() {
    let uavMakeInfo = this.droneRegisterForm.get('uavMakeInfo') as FormGroup;
    return uavMakeInfo.controls;
  }
  get avionics() {
    let avionics = this.droneRegisterForm.get('avionics') as FormGroup;
    return avionics.controls;
  }
  get comms() {
    let comms = this.droneRegisterForm.get('comms') as FormGroup;
    return comms.controls;
  }
  get droneImage() {
    let droneImage = this.droneRegisterForm.get('droneImage') as FormGroup;
    return droneImage.controls;
  }
  //During edit-drone&gears section on click of discard button
  onDiscardChanges() {
    //resting the form with pre filled values
    if (this.matchedDrone != null && this.matchedDrone !== undefined) {
      this.droneRegisterForm.reset();
      if (this.matchedDrone?.DroneImages.length > 0) {
        this.matchedDrone?.DroneImages.forEach((image) => {
          if (image.Type == 'front') {
            this.droneFrontImageFileName = 'Already Uploaded';
            this.droneFrontImageFlag = 1;
            this.droneRegisterForm.get('droneImage').patchValue({
              droneFrontImageFile: 'URL_PRESENT',
              droneFrontImageFileType: image.FormatType,
            });
          }
          if (image.Type == 'side') {
            this.droneSideImageFileName = 'Already Uploaded';
            this.droneSideImageFlag = 1;
            this.droneRegisterForm.get('droneImage').patchValue({
              // droneSideImageFile : image.DroneImage,
              droneSideImageFile: 'URL_PRESENT',
              droneSideImageFileType: image.FormatType,
            });
          }
          if (image.Type == 'isometric') {
            this.droneIsometricImageFileName = 'Already Uploaded';
            this.droneIsometricImageFlag = 1;
            this.droneRegisterForm.get('droneImage').patchValue({
              droneIsometricImageFile: 'URL_PRESENT',
              droneIsometricImageFileType: image.FormatType,
            });
          }
        });
      }
      this.droneRegisterForm.get('uavInfo').patchValue({
        model: this.matchedDrone?.Model,
        uinNumber: this.matchedDrone?.UIN,
        type: this.matchedDrone?.UAVInfoType.Value,
        class: this.matchedDrone?.UAVInfoClass.Value,
        endurance: this.matchedDrone?.Endurance,
        maxSpeed: this.matchedDrone?.MaximumSpeed,
        gpsManufacturer: this.matchedDrone?.GPSManufacturer,
        gpsModel: this.matchedDrone?.GPSmodel,
        gpsType: this.matchedDrone?.UAVInfoGPSType.Value,
      });
      // this.droneRegisterForm.get('uavInfo.type').setValue(this.matchedDrone.UAVInfoType);
      this.droneRegisterForm.get('uavMakeInfo').patchValue({
        manufacturer: this.matchedDrone?.UAVMakeInfoManufacturer.Value,
        maxDimension: this.matchedDrone?.Maxdimension,
        certificate:
          this.matchedDrone?.UAVMakeInfoCertificate == true ? 'true' : 'false',
      });
      this.droneRegisterForm.get('avionics').patchValue({
        flightController: this.matchedDrone?.AvionicsFlightController.Value,
        gcs: this.matchedDrone?.AvionicsGCS.Value,
        protocol: this.matchedDrone?.AvionicsProtocol.Value,
      });
      this.droneRegisterForm.get('comms').patchValue({
        commsType: this.matchedDrone?.CommsType.Value,
        commsRange: this.matchedDrone?.CommsRange,
        commsMake: this.matchedDrone?.CommsMake,
      });
    }
  }
  //During edit-drone&gears section on click of Save Changes button
  onDroneUpdate() {
    //Updating the existing drone.
    this.submitted = true;
    if (this.droneRegisterForm.valid) {
      this.droneImagesPayloadFormer();
      this.payload = {
        // OperatorId: this.profileDetails.UserId,
        DroneId: this.paramValue,
        Model: this.droneRegisterForm.value.uavInfo.model,
        UIN: this.droneRegisterForm.value.uavInfo.uinNumber.toUpperCase(),
        // UAVInfoType: this.droneRegisterForm.value.uavInfo.type,
        // UAVInfoClass: this.droneRegisterForm.value.uavInfo.class,
        Endurance: this.droneRegisterForm.value.uavInfo.endurance,
        MaximumSpeed: this.droneRegisterForm.value.uavInfo.maxSpeed,
        GPSManufacturer: this.droneRegisterForm.value.uavInfo.gpsManufacturer,
        GPSmodel: this.droneRegisterForm.value.uavInfo.gpsModel,
        // UAVInfoGPSType: this.droneRegisterForm.value.uavInfo.gpsType,
        // UAVMakeInfoManufacturer: this.droneRegisterForm.value.uavMakeInfo.manufacturer,
        Maxdimension: this.droneRegisterForm.value.uavMakeInfo.maxDimension,
        // AvionicsFlightController: this.droneRegisterForm.value.avionics.flightController,
        // AvionicsGCS: this.droneRegisterForm.value.avionics.gcs,
        // AvionicsProtocol: this.droneRegisterForm.value.avionics.protocol,
        CommsType: this.droneRegisterForm.value.comms.commsType,
        CommsRange: this.droneRegisterForm.value.comms.commsRange,
        CommsMake: this.droneRegisterForm.value.comms.commsMake,
        UAVMakeInfoCertificate:
          this.droneRegisterForm.value.uavMakeInfo.certificate,
        DroneImages: this.droneImagesArr,
      };
      this.droneRegisterForm.value.uavMakeInfo.certificate === 'true'
        ? (this.payload['UAVMakeInfoCertificate'] = true)
        : (this.payload['UAVMakeInfoCertificate'] = false);
      this.payloadFormer('uav-info-type');
      this.payloadFormer('uav-info-class');
      this.payloadFormer('uav-info-gps-type');
      this.payloadFormer('uav-make-info-manufacturer');
      this.payloadFormer('avionics-flight-controller');
      this.payloadFormer('avionics-gcs');
      this.payloadFormer('avionics-protocol');
      this.payloadFormer('comms-type');
      this.loader = true;
      //API to update the drone
      this.operatorApi.droneUpdation(this.payload).then(
        (res) => {
          this.droneImagesArr = [];
          this.loader = false;
          //Method to intialize the getDronesAndGearsList service
          this.getDronesListApi();
          this.swal.showSwal('droneUpdateSuccess');
        },
        (err) => {}
      );
    }
  }

  //On click of Front image field
  droneFrontImageFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.droneFrontImageFileSizeError = false;
      this.droneFrontImageFileTypeError = false;
      this.droneFrontImageFlag = 1;
      this.droneFrontImageFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.droneRegisterForm.get('droneImage').patchValue({
          droneFrontImageFile: splitArr[1],
          droneFrontImageFileType: file.name.endsWith('.jpeg') ? 'jpeg' : 'png',
        });
      });
    } else {
      this.droneFrontImageFlag = 0;
      if (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) {
        this.droneFrontImageFileSizeError = true;
        this.droneFrontImageFileTypeError = false;
      } else {
        this.droneFrontImageFileTypeError = true;
        this.droneFrontImageFileSizeError = false;
      }
    }
  }
  //On click of Side image field
  droneSideImageFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.droneSideImageFileSizeError = false;
      this.droneSideImageFileTypeError = false;
      this.droneSideImageFlag = 1;
      this.droneSideImageFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.droneRegisterForm.get('droneImage').patchValue({
          droneSideImageFile: splitArr[1],
          droneSideImageFileType: file.name.endsWith('.jpeg') ? 'jpeg' : 'png',
        });
      });
    } else {
      this.droneSideImageFlag = 0;
      if (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) {
        this.droneSideImageFileSizeError = true;
        this.droneSideImageFileTypeError = false;
      } else {
        this.droneSideImageFileTypeError = true;
        this.droneSideImageFileSizeError = false;
      }
    }
  }
  //On click of Isometric image field
  droneIsometricImageFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.droneIsometricImageFileSizeError = false;
      this.droneIsometricImageFileTypeError = false;
      this.droneIsometricImageFlag = 1;
      this.droneIsometricImageFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.droneRegisterForm.get('droneImage').patchValue({
          droneIsometricImageFile: splitArr[1],
          droneIsometricImageFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : 'png',
        });
      });
    } else {
      this.droneIsometricImageFlag = 0;
      if (file.name.endsWith('.jpeg') || file.name.endsWith('.png')) {
        this.droneIsometricImageFileSizeError = true;
        this.droneIsometricImageFileTypeError = false;
      } else {
        this.droneIsometricImageFileTypeError = true;
        this.droneIsometricImageFileSizeError = false;
      }
    }
  }
  // File to base64
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  resetFrontImageFileUploads() {
    this.droneRegisterForm.get('droneImage').patchValue({
      droneFrontImageFile: '',
      droneFrontImageFileType: '',
    });
    this.droneFrontImageFileSizeError = false;
    this.droneFrontImageFileTypeError = false;
    this.droneFrontImageFileName = '';
    this.droneFrontImageFlag = 0;
  }
  resetSideImageFileUploads() {
    this.droneRegisterForm.get('droneImage').patchValue({
      droneSideImageFile: '',
      droneSideImageFileType: '',
    });
    this.droneSideImageFileSizeError = false;
    this.droneSideImageFileTypeError = false;
    this.droneSideImageFileName = '';
    this.droneSideImageFlag = 0;
  }
  resetIsometricImageFileUploads() {
    this.droneRegisterForm.get('droneImage').patchValue({
      droneIsometricImageFile: '',
      droneIsometricImageFileType: '',
    });
    this.droneIsometricImageFileSizeError = false;
    this.droneIsometricImageFileTypeError = false;
    this.droneIsometricImageFileName = '';
    this.droneIsometricImageFlag = 0;
  }

  //Method to intialize the getDronesAndGearsList service
  getDronesListApi() {
    let payload = {
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorApi.getDronesAndGearsList(payload).then((res: any) => {
      // console.log('intialize from getDronesAndGears API from Edit and Register',res);
    });
  }
}
