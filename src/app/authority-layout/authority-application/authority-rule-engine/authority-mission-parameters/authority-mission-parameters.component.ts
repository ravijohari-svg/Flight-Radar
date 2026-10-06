import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-authority-mission-parameters',
  templateUrl: './authority-mission-parameters.component.html',
  styleUrls: ['./authority-mission-parameters.component.scss'],
})
export class AuthorityMissionParametersComponent implements OnInit {
  //Loader
  loader;
  loaderKey;
  // Mission Parameters
  missionParametersArr;
  flightPurposeArr;

  //Swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });
  editingFlightPurpose: any;
  flightPurposeData: any;

  // Show swal
  // This function displays a confirmation in the form of a
  // dialog asking the user to confirm before editing,deleting,updating the mission parameter
  showSwal(type, option1?, option2?) {
    switch (type) {
      case 'edit-ActivityType':
      case 'edit-coRelationParameter':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: 'Are you sure? Please confirm once to update values',
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Confirm',
          })
          .then((result) => {
            if (result.isConfirmed) {
              if (type === 'edit-ActivityType') {
                this.updateActivityType();
              } else if (type === 'edit-coRelationParameter') {
                this.updateCoRelationParameters();
              }
            }
          });
        break;

      case 'update-success':
      case 'update-CoRelation-success':
        this.swalWithBootstrapButtons.fire({
          background: '#1b1f27',
          text: 'Updated Successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 1000,
        });
        break;

      case 'delete-FlightPurpose':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: "Are you sure? You won't be able to revert back?",
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Delete',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.onDeleteFlightPurpose(option1, option2);
            }
          });
        break;

      case 'delete-activityParameter':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: "Are you sure? You won't be able to revert back?",
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Delete',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.onDeleteActivityTypeParameters(option1, option2);
            }
          });
        break;

      case 'delete-CoRelationParameter':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: "Are you sure? You won't be able to revert back?",
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Delete',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.onDeleteCoRelation(option1, option2);
            }
          });
        break;

      case 'error-time':
        this.swalWithBootstrapButtons.fire({
          background: '#1b1f27',
          text: 'Start/End time already exist',
          icon: 'error',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 1000,
        });
        break;

      case 'error-date':
        this.swalWithBootstrapButtons.fire({
          background: '#1b1f27',
          text: 'Start/End date already exist',
          icon: 'error',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false,
          timer: 1000,
        });
        break;

      case 'delete-TimeDate':
        this.swalWithBootstrapButtons
          .fire({
            background: '#1b1f27',
            text: "Are you sure? You won't be able to revert back?",
            focusConfirm: false,
            showCancelButton: true,
            allowOutsideClick: false,
            confirmButtonText: 'Delete',
          })
          .then((result) => {
            if (result.isConfirmed) {
              this.onDeleteTimeDate(option1, option2);
            }
          });
        break;

      default:
        break;
    }
  }

  //Activity type
  addActivityTypeForm;
  addFlightPurposeForm;
  activityParameters;
  permissionList = [
    {
      Name: 'Manual',
      Value: 'Manual',
    },
    {
      Name: 'Auto Approve',
      Value: 'Auto-Approve',
    },
    {
      Name: 'Auto Reject',
      Value: 'Auto-Reject',
    },
  ];

  //Modal
  modalRef: BsModalRef;

  submitted;
  selectedDropDownType;

  //Editing Activity Parameters
  editFlag;
  editingActivityType;

  // CoRelation Mission Parameter
  coRelationArr;
  selectedDropDownTypeCoRelation;
  addCoRelationForm;

  editingCoRelation;

  //Date and Time
  dateAndTimeList;
  selectedDropDownTypeTimeDate;
  addTimeDateForm: FormGroup;
  dateId;
  timeId;

  //Weather
  weatherList;
  addWeatherForm: FormGroup;
  selectedDropDownWeather;
  editingWeatherValue;
  timer;
  constructor(
    private authorityApi: AuthorityapisService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addActivityTypeForm = this.fb.group({
      ActivityType: ['', Validators.required],
      Permission: ['', [Validators.required]],
    });
    this.addFlightPurposeForm = this.fb.group({
      FlightPurpose: ['', Validators.required],
      Permission: ['', [Validators.required]],
    });
    this.addCoRelationForm = this.fb.group({
      Value: ['', Validators.required],
      Permission: ['', [Validators.required]],
    });
    this.addTimeDateForm = this.fb.group(
      {
        Start: ['', [Validators.required]],
        End: ['', [Validators.required]],
        Permission: [''],
      },
      {
        validators: [this.startEndTime.bind(this)],
      }
    );
    this.addWeatherForm = this.fb.group({
      Type: [''],
      Min: [''],
      Max: [''],
      Permission: ['', [Validators.required]],
    });
    this.initialFunction();
  }
  async initialFunction() {
    try {
      this.loader = true;
      await this.getTimeDate();
      await this.getWeather();
      await this.getActivityType();
      await this.getPurposeFlight();
      await this.getCoRelation();
    } catch (error) {
      console.log(error);
    } finally {
      this.loader = false;
    }
  }

  //This function will show all the purpose of all the fight in the Flight purpose section
  async getPurposeFlight() {
    this.loaderKey = 'getPurposeFlight';
    try {
      const res = await this.authorityApi.getFlightPurpose();
      this.flightPurposeArr = [
        {
          Category: 'Flight Purpose',
          Header: 'Purpose',
          Parameters: res.data.MainData,
        },
      ];
    } catch (err) {
      console.error(err);
    }
  }

  //Activity type - Its actions and updation, forms
  //This function will show all the  Activity types
  async getActivityType() {
    this.loaderKey = 'getActivityType';

    try {
      const res = await this.authorityApi.getActivityType();
      this.missionParametersArr = [
        {
          Category: 'Activity Type',
          Header: 'Types',
          Parameters: [],
        },
      ];
      this.missionParametersArr.forEach((value, index): any => {
        value.Parameters = res.data.MainData;
      });
    } catch (err) {}
  }

  //After any successfully edition,deletion,addition of activity type in mission parameter this function is to update
  //and show all the parameters in it
  updatedActivityType(res) {
    this.onCancel();
    this.missionParametersArr.forEach((value, index): any => {
      value.Parameters = res.data.MainData;
    });
    this.activityParameters = this.missionParametersArr;
  }

  //After any successfully edition,deletion,addition of flight purpose in mission parameter this function is to update
  //and show all the parameters in it
  updatedFlightPurpose(res) {
    this.onCancel();
    this.flightPurposeData = res.data.MainData;
    this.flightPurposeArr.forEach((value, index): any => {
      value.Parameters = res.data.MainData;
    });
    //this.flightPurposeArr = this.flightPurposeData
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addActivityTypeForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChange(Permission) {
    this.addActivityTypeForm.patchValue({
      Permission: Permission,
    });
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addFlightPurposeForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChangeFlightPurpose(Permission) {
    this.addFlightPurposeForm.patchValue({
      Permission: Permission,
    });
  }
  addActivityType(addMissiom: TemplateRef<any>, dropdownType) {
    this.modalRef = this.modalService.show(addMissiom, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    this.selectedDropDownType = dropdownType;
  }

  addPurposeofFlight(addFlight: TemplateRef<any>) {
    this.modalRef = this.modalService.show(addFlight, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  //In add parameter window after filling information when we click the add button
  //your information will add
  addActivityTypeSubmit(dropdownType) {
    this.submitted = true;
    if (this.addActivityTypeForm.valid) {
      this.loader = true;
      let payload = {
        // ActivityType: this.selectedDropDownType,
        // Permission: this.addActivityTypeForm.value.Permission
        ...this.addActivityTypeForm.value,
      };
      this.authorityApi.addActivityType(payload).then(
        (res) => {
          this.loader = false;
          this.showSwal('update-success');
          this.updatedActivityType(res);
          // this.redirectTo('authority/authority-app/rule-engine');
        },
        (err) => {
          this.loader = false;
        }
      );
      this.modalService.hide();
    }
  }

  //In add parameter window after filling information when we click the add button
  // your information will add
  addFlightPurposeSubmit(dropdownType) {
    this.submitted = true;
    if (this.addFlightPurposeForm.valid) {
      this.loader = true;
      let payload = {
        // ActivityType: this.selectedDropDownType,
        // Permission: this.addActivityTypeForm.value.Permission
        ...this.addFlightPurposeForm.value,
      };
      this.authorityApi.addPurposeFlight(payload).then(
        (res) => {
          this.loader = false;
          this.showSwal('update-success');
          this.updatedFlightPurpose(res);
          // this.redirectTo('authority/authority-app/rule-engine');
        },
        (err) => {
          this.loader = false;
        }
      );
      this.modalService.hide();
    }
  }

  // This function is a getter that returns the form controls of the addFlightPurposeForm form group
  get purposeFlight() {
    return this.addFlightPurposeForm.controls;
  }

  // This function is a getter that returns the form controls of the addActivityTypeForm form group
  get activityType() {
    return this.addActivityTypeForm.controls;
  }

  //Editing Activity Parameter

  //Editing Type Activity Parameter
  //By clicking on the edit button in the type activity this function will open a Apply parameter window
  onEditActivityTypeParameters(
    addMissiom: TemplateRef<any>,
    type,
    dropdownType
  ) {
   
    this.editFlag = true;
    this.selectedDropDownType = dropdownType;
    this.addActivityTypeForm.patchValue({
      ActivityType: type.ActivityType,
      Permission: type.Permission,
    });
    this.editingActivityType = type;
    this.modalRef = this.modalService.show(addMissiom, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  //Editing Flight Purpose Parameter
  //By clicking on the edit button in the flight purpose parameter this function will open a Apply parameter window
  onEditFlightPurposeParameters(addFlight: TemplateRef<any>, type) {
    this.editFlag = true;
    this.addFlightPurposeForm.patchValue({
      FlightPurpose: type.FlightPurpose,
      Permission: type.Permission,
    });
    this.editingFlightPurpose = type;
    this.modalRef = this.modalService.show(addFlight, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  //By clicking on the apply button in the Apply parameter window this function will call a function updateActivityType()
  // and update your details.
  editActivityTypeSubmit() {
    this.submitted = true;
    if (this.addActivityTypeForm.valid) {
      this.updateActivityType();
    }
  }

  //By clicking on the apply button in the Apply parameter window this function will call a function updateflightpurpose()
  //and update your details.
  editFlightPurposeSubmit() {
   
    this.submitted = true;
    if (this.addFlightPurposeForm.valid) {
      this.updateFlightPurpose();
    }
  }

  //This function will call an api to updated the above details  in the flight purpose section in the mission parameter
  updateFlightPurpose() {
    this.loader = true;
    let payload = {
      ...this.addFlightPurposeForm.value,
      MissionFlightPurposeId: this.editingFlightPurpose.MissionFlightPurposeId,
      SearchFlightPurpose: this.editingFlightPurpose.SearchFlightPurpose,
    };
    this.authorityApi.editFlightPurpose(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedFlightPurpose(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
    this.modalService.hide();
  }

  //This function will call an api to updated the above details  in the Activity type section in the mission parameter
  updateActivityType() {
    this.loader = true;
    let payload = {
      DropDownType: this.selectedDropDownType,
      ...this.addActivityTypeForm.value,
      MissionActivityId: this.editingActivityType.MissionActivityId,
    };
    this.authorityApi.editActivityType(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedActivityType(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
    this.modalService.hide();
  }

  //Delete Parameter
  //This function will call an api to delete the above details  in the Activity type section in the mission parameter
  onDeleteActivityTypeParameters(type, dropdownType) {
    this.loader = true;
    let payload = {
      DropDownType: dropdownType,
      MissionActivityId: type.MissionActivityId,
    };
    this.authorityApi.deleteActivityType(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedActivityType(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //This function will call an api to delete the above details  in the flight purpose section in the mission parameter
  onDeleteFlightPurpose(type, dropdownType) {
    this.loader = true;
    let payload = {
      MissionFlightPurposeId: type.MissionFlightPurposeId,
    };
    this.authorityApi.deleteFlightPurpose(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedFlightPurpose(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //Time and Date
  //This function show all the time and date in the time and date section of mission parameter
  async getTimeDate() {
    this.loaderKey = 'getDateTime';
    try {
      const res = await this.authorityApi.getDateTime();
      const dateTime = res['data'].MainData;
      this.dateAndTimeList = {
        Category: 'Time and Date',
        Header: 'Time and Date',
        Dates: dateTime.Date,
      };
    } catch (err) {
      console.error(err);
    }
  }

  //By clicking on the add button this function will open a add parameter window
  addTimeDate(addTimeDate: TemplateRef<any>, dropdownType, dateId?) {
    this.modalRef = this.modalService.show(addTimeDate, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    this.selectedDropDownTypeTimeDate = dropdownType;
    this.dateId = dateId;
    if (this.selectedDropDownTypeTimeDate == 'Time') {
      this.addTimeDateForm
        .get('Permission')
        .setValidators([Validators.required]);
    } else {
      this.addTimeDateForm.get('Permission').clearValidators();
    }
    this.addTimeDateForm.get('Permission').updateValueAndValidity();
  }

  // This function is a getter that returns the form controls of the addTimeDateForm form group
  get timeDateParameter() {
    return this.addTimeDateForm.controls;
  }

  // This is a getter function that retrieves and returns the errors property of the addTimeDateForm object
  get errors() {
    return this.addTimeDateForm.errors;
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addTimeDateForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChangeTimeDate(Permission) {
    this.addTimeDateForm.patchValue({
      Permission: Permission,
    });
  }

  //In add parameter window after filling information when we click the add button
  // your information will add
  addTimeDateSubmit() {
    this.submitted = true;
    if (this.addTimeDateForm.valid) {
      this.loader = true;
      let payload: any = {
        Start: this.addTimeDateForm.value.Start,
        End: this.addTimeDateForm.value.End,
        Type: this.selectedDropDownTypeTimeDate,
      };
      if (this.selectedDropDownTypeTimeDate == 'Time') {
        payload = {
          ...payload,
          Permission: this.addTimeDateForm.value.Permission,
          Id: this.dateId,
        };
      }
      this.authorityApi.addDateTime(payload).then(
        (res: any) => {
          this.dateAndTimeList.Dates = res.data.MainData.Date;
          this.loader = false;
          this.showSwal('update-success');
        },
        (err) => {
          this.loader = false;
          if (
            err.error.error.type == 'Invalid Start' ||
            err.error.error.type == 'Invalid End'
          ) {
            if (this.selectedDropDownTypeTimeDate == 'Time') {
              this.showSwal('error-time');
            } else {
              this.showSwal('error-date');
            }
          }
        }
      );
      this.modalService.hide();
      this.onCancel();
    }
  }

  //Delete Parameter
  //BY clicking on the delete button this function will delete the above parameter
  onDeleteTimeDate(Type, ids) {
    this.loader = true;
    let payload = {
      Type,
      ...ids,
    };
    this.authorityApi.deleteTimeDate(payload).then(
      (res: any) => {
        this.loader = false;
        this.dateAndTimeList.Dates = res.data.MainData.Date.filter((date) => {
          if (date != null) {
            date.Time = date.Time.filter((time) => {
              return time != null;
            });
            return date;
          }
        });
        this.showSwal('update-success');
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //Weather based rule-engine
  //This function show all the weather information in the weather section of the mission parameter  these are
  //all predefined check points for the mission when a mission is planned
  async getWeather() {
    this.loaderKey = 'getWeather';

    try {
      const res = await this.authorityApi.getWeather();
      const weather = res.data.MainData;
      const weatherParameters = [
        {
          Parameter: 'Weather',
          Values: weather.Weather,
        },
        {
          Parameter: 'Wind Direction',
          Values: weather.WindDeg,
          Units: '°',
        },
        {
          Parameter: 'Wind Speed',
          Values: weather.WindSpeed,
          Units: 'm/s',
        },
        {
          Parameter: 'Temperature',
          Values: weather.Temperature,
          Units: '°C',
        },
      ];
      this.weatherList = {
        Category: 'Weather',
        Header: 'WeatherMap',
        weatherParameters,
      };
    } catch (err) {
      console.error(err);
    }
  }

  //Editing CoRelation Parameter
  //By clicking on the edit button this function will open a Apply parameter window
  onEditWeather(editWeather: TemplateRef<any>, dropdownType, value) {
    this.editFlag = true;
    this.selectedDropDownWeather = dropdownType;
    this.editingWeatherValue = value;
    if (this.selectedDropDownWeather == 'Weather') {
      this.addWeatherForm.patchValue({
        Type: this.editingWeatherValue.Type,
        Permission: this.editingWeatherValue.Permission,
      });
    } else {
      this.addWeatherForm.patchValue({
        Min: this.editingWeatherValue.Min,
        Max: this.editingWeatherValue.Max,
        Permission: this.editingWeatherValue.Permission,
      });
    }
    this.modalRef = this.modalService.show(editWeather, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addWeatherForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChangeWeather(Permission) {
    this.addWeatherForm.patchValue({
      Permission: Permission,
    });
  }

  // This function is a getter that returns the form controls of the addWeatherForm form group
  get weatherParameter() {
    return this.addWeatherForm.controls;
  }

  //By clicking on the apply button in the Apply parameter window this function will call an api
  //and update your details.
  editWeatherSubmit() {
    this.submitted = true;
    if (this.addWeatherForm.valid) {
      this.loader = true;
      let payload: any = {
        Permission: this.addWeatherForm.value.Permission,
        Id: this.editingWeatherValue.Id,
        Type:
          this.selectedDropDownWeather == 'Weather'
            ? 'Weather'
            : this.editingWeatherValue.Type,
      };
      // if (this.selectedDropDownWeather == 'Weather') {
      //   payload = {
      //     ...payload,
      //     Type: this.editingWeatherValue.Type,
      //   }
      // }
      this.authorityApi.editWeather(payload).then(
        (res) => {
          let weather = res.data.MainData;
          let weatherParameters = [
            {
              Parameter: 'Weather',
              Values: weather.Weather,
            },
            {
              Parameter: 'Wind Direction',
              Values: weather.WindDeg,
            },
            {
              Parameter: 'Wind Speed',
              Values: weather.WindSpeed,
            },
            {
              Parameter: 'Temperature',
              Values: weather.Temperature,
            },
          ];

          this.loader = false;
          this.weatherList = {
            Category: 'Weather',
            Header: 'WeatherMap',
            weatherParameters,
          };
          this.loader = false;
          this.showSwal('update-success');
        },
        (err) => {
          this.loader = false;
        }
      );
      this.modalService.hide();
      this.onCancel();
    }
  }

  // CoRelation
  //This function will give all the coRelation details by call an api getcoRelation
  async getCoRelation() {
    this.loaderKey = 'getCoRelation';

    try {
      const res = await this.authorityApi.getCoRelation();
      const coRelation = res.data.MainData;
      // console.log(CoRelation);
      this.coRelationArr = [
        {
          Category: 'Airspace Permissions',
          Header: 'Co-relation',
          Parameters: [
            {
              Value: 'vfr',
              Name: 'VFR',
            },
            {
              Value: 'airport',
              Name: 'Airport',
            },
            // {
            //   Value: 'greenZones',
            //   Name: 'Green Zones'
            // },
            {
              Value: 'greenZones',
              Name: 'Green Zones',
            },
            {
              Value: 'geozone',
              Name: 'Airspace geozones',
            },
            {
              Value: 'FIC',
              Name: 'FIC',
            },
          ],
        },
      ];
      this.coRelationArr.forEach((parameter) => {
        parameter.Parameters.forEach((values: any) => {
          for (let [key, value] of Object.entries(coRelation)) {
            if (key == values.Value) {
              values.Types = value;
              break;
            }
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  // This function is called when the user clicks on one of the radio buttons to
  // select a permission type. It updates the Permission field value in the addCoRelationForm
  // group with the selected value. This is done using the patchValue() method, which updates
  // the value of the specified form control without affecting the other controls in the form.
  onPermissionChangeCoRelation(Permission) {
    this.addCoRelationForm.patchValue({
      Permission: Permission,
    });
  }

  //By clicking on the add button this function will open a add parameter window
  addCoRelation(addCoRelation: TemplateRef<any>, dropdownType) {
    this.modalRef = this.modalService.show(addCoRelation, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    this.selectedDropDownTypeCoRelation = dropdownType;
  }

  //In add parameter window after filling information when we click the add button
  // your information will add
  addCoRelationSubmit() {
    this.submitted = true;
    if (this.addCoRelationForm.valid) {
      this.loader = true;
      let payload = {
        DropDownType: this.selectedDropDownTypeCoRelation,
        ...this.addCoRelationForm.value,
      };
      this.authorityApi.addCoRelation(payload).then(
        (res) => {
          this.loader = false;
          this.showSwal('update-success');
          this.updatedCoRelation(res);
          // this.redirectTo('authority/authority-app/rule-engine');
        },
        (err) => {
          this.loader = false;
        }
      );
      this.modalService.hide();
    }
  }

  //This function is a getter that returns the form controls of the addCorealtionForm group
  get coRelationParameter() {
    return this.addCoRelationForm.controls;
  }

  //Editing CoRelation Parameter
  //By clicking on the edit button this function will open a Apply parameter window
  onEditCoRelation(addCoRelation: TemplateRef<any>, type, dropdownType) {
    this.editFlag = true;
    this.selectedDropDownType = dropdownType;
    this.addCoRelationForm.patchValue({
      Value: type.Value,
      Permission: type.Permission,
    });
    this.editingCoRelation = type;
    this.modalRef = this.modalService.show(addCoRelation, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }

  //By clicking on the apply button in the Apply parameter window this function will call a function updateCoRelationParameters()
  //and update your details.
  editCoRelationSubmit() {
    this.submitted = true;
    if (this.addCoRelationForm.valid) {
      this.updateCoRelationParameters();
    }
  }

  //This function will call an api to updated the above details in the drone parameters
  updateCoRelationParameters() {
    this.loader = true;
    let payload = {
      DropDownType: this.selectedDropDownType,
      Permission: this.addCoRelationForm.value.Permission,
      Id: this.editingCoRelation.Id,
      Value: this.editingCoRelation.Value,
    };
    this.authorityApi.editCoRelation(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedCoRelation(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
    this.modalService.hide();
  }

  //Delete Parameter
  //BY clicking on the delete button this function will delete the above parameter
  onDeleteCoRelation(type, dropdownType) {
    this.loader = true;
    let payload = {
      DropDownType: dropdownType,
      Id: type.Id,
    };
    this.authorityApi.deleteCoRelation(payload).then(
      (res) => {
        this.loader = false;
        this.showSwal('update-success');
        this.updatedCoRelation(res);
        // this.redirectTo('authority/authority-app/rule-engine');
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //After any successfully edition,deletion,addition of coRelation parameter this function is to update
  //all the parameter
  updatedCoRelation(res) {
    this.onCancel();
    let CoRelation = res.data.MainData;
    this.coRelationArr.forEach((parameter) => {
      parameter.Parameters.forEach((values: any) => {
        for (let [key, value] of Object.entries(CoRelation)) {
          if (key == values.Value) {
            values.Types = value;
            values.Types = values.Types.filter(function (el) {
              return el != null;
            });
            break;
          }
        }
      });
    });
  }

  //Custom Validation
  startTime(formControl: FormControl) {
    const { value: Start } = formControl;
    let startDate: any = new Date(Start);
    // (!isNaN(startDate)) &&
    if (startDate.getDate()) {
      return new Date() <= startDate ? null : { startTime: true };
    } else {
      return null;
    }
  }
  startEndTime(formgroup: FormGroup) {
    const { value: startTime } = formgroup.get('Start');
    const { value: endTime } = formgroup.get('End');
    const Start = new Date(startTime);
    const End = new Date(endTime);
    if (Start.getDate() && End.getDate()) {
      return End >= Start ? null : { startEndTime: true };
    } else {
      return null;
    }
  }

  //Implemenation of trackBy option function
  getCategory(index: number, category: any): string {
    return category.Category;
  }

  getParameter(index: number, parameter: any): string {
    return parameter.ActivityType;
  }
  getCategoryFlight(index: number, category: any): string {
    return category.Category;
  }
  getParameterFlight(index: number, parameter: any): string {
    return parameter.FlightPurpose;
  }
  getCategorycoRelation(index: number, category: any): string {
    return category.Category;
  }
  getParametercoRelation(index: number, parameter: any): string {
    return parameter.Name;
  }
  getTypeParameter(index: number, type: any): string {
    return type.Value;
  }
  getdateAndTimeList(index: number, date: any): number {
    return date.Start;
  }
  getTimeOfDate(index: number, time: any): number {
    return time.Start;
  }
  getTypeWeather(index: number, type: any): string {
    return type.Parameter;
  }
  getValueType(index: number, value: any): string {
    return value.Type;
  }
  getPermisssionActivity(index: number, permission: any): string {
    return permission.Name;
  }
  getPermissionFlight(index: number, permission: any): string {
    return permission.Name;
  }
  getPermissioncoRelation(index: number, permission: any): string {
    return permission.Name;
  }
  getPermissionAddDate(index: number, permission: any): string {
    return permission.Name;
  }
  getPermissionAddWeather(index: number, permission: any): string {
    return permission.Name;
  }

  //Cancel
  onCancel() {
    this.addActivityTypeForm.reset();
    this.addCoRelationForm.reset();
    this.addFlightPurposeForm.reset();
    this.addTimeDateForm.reset();
    this.addWeatherForm.reset();
    if (this.modalRef) {
      this.modalRef.hide();
    }
    this.submitted = false;
    this.editFlag = false;
  }
  //Redirect to same URL
  redirectTo(uri: string) {
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]));
  }
}
