import { Component, OnInit } from '@angular/core';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Constants } from 'src/app/constants/constants';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss'],
})
export class AdminListComponent implements OnInit {
  //Loader
  loader;
  profileDetails;
  getAuthoritiesDetailsData = [];
  getAuthoritiesDetailsDataValid = [];
  submitted;
  //Modal
  modalRef: BsModalRef;
  modalRef2: BsModalRef;
  //form
  addAdminForm: FormGroup;
  addAdminAuthForm: FormGroup;
  //toggle between Edit and ADD new user form
  toggleForm;
  pwdMismatch;
  editFlag;
  //To get the Cuntry/state/city
  countryArr = [];
  countryApiData = [];
  stateApiData = [];
  firApiData = [];
  mapLayersApiData = [];
  mapLayerArr = [];
  selectedMapLayer = [];
  stateArr = [];
  firArr = [];
  cityArr = [];
  defaultCountry;
  //Dropdown list
  // levelArr = ['Admin', 'L1', 'L2', 'L3', 'L4',];
  levelArr = [];
  filterLevel = [];
  titleName = '';
  selectedOption = '';
  //Search
  authoritySearchBy = [];
  selected;
  userDetailsVal;
  rawData;
  searchByFlag;

  firDropdownFlag = false;
  stateDropdownFlag = false;

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

  constructor(
    private authorityApi: AuthorityapisService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initialApiCall();
    this.initialFunction();
    //Initializing the variable with constants
    this.levelArr = Constants.levelArr;
    this.filterLevel = Constants.filterLevel;
    //for country dropdown
    let payload = {
      Country: '',
    };
    this.authorityApi.getCountryState(payload).then(
      (res) => {
        // this.countryArr = res?.data?.MainData;
        this.countryApiData = res['data']?.MainData;
        let countryRecevied = res['data']?.MainData;
        countryRecevied = countryRecevied.map((country) => {
          return country.name;
        });
        this.countryArr = countryRecevied;
      },
      (err) => {}
    );
  }

  //Contain those functionality needed at first run of this component
  initialApiCall() {
    this.loader = true;
    this.toggleForm = true;
    this.submitted = false;

    //API with promises (New version)
    //API to get Regulators/Authorityes data
    this.authorityApi.getAuthoritiesProfileDetails().then(
      (res) => {
        this.getAuthoritiesDetailsDataValid = res['data']?.MainData;
        this.getAuthoritiesDetailsData = res['data']?.MainData;
        this.loader = false;
        //search
        let arr = [];
        this.rawData = this.getAuthoritiesDetailsData;
        //To form search dropdown
        if (this.getAuthoritiesDetailsData.length != 0) {
          this.getAuthoritiesDetailsData.map((val) => {
            arr.push({
              UserId: val.UserId,
              Name: val.FirstName + ' ' + val.LastName,
              Level: val.Level,
              custom:
                val.UserId +
                ', ' +
                val.Level +
                ', ' +
                val.FirstName +
                ' ' +
                val.LastName,
            });
          });
          this.authoritySearchBy = arr;
        }
      },
      (err) => {
        this.loader = false;
      }
    );
  }

  //To build Form on first render of component
  initialFunction() {
    //TO create Form
    this.addAdminForm = this.fb.group({
      UserId: new FormControl(''),
      FirstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      LastName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      EmailId: new FormControl('', [Validators.required, Validators.email]),
      Age: new FormControl('', [Validators.required]),
      PhoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('[0-9]{10}'),
      ]),
      Role: new FormControl('Admin', [Validators.required]),
      Level: new FormControl('', [Validators.required]),
      Country: new FormControl('', [Validators.required]),
      State: new FormControl(''),
      Fir: new FormControl(''),
      // Maplayer: new FormControl('', [Validators.required]),
      Maplayer: new FormControl(''),
      Zone: new FormControl(''),
      Location: new FormControl(''),
    });
    this.addAdminAuthForm = this.fb.group({
      UserName: new FormControl('', [Validators.required]),
      VerificationCode: new FormControl('', [Validators.required]),
      Password: new FormControl('', [Validators.required]),
      ConfirmPassword: new FormControl('', [Validators.required]),
    });
  }

  //On Click of create Admin button
  addAdmin(addAdmin, dropdownType) {
    this.stateArr = [];
    this.cityArr = [];
    this.editFlag = false;
    //Open Form
    this.modalRef = this.modalService.show(addAdmin, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    // this.selectedDropDownType = dropdownType;
  }
  //On Click of cancel button to reset Form
  onCancel() {
    this.addAdminForm.reset();
    this.modalRef.hide();
    this.submitted = false;
    // this.editFlag = false;
  }

  // addAdminAuthForm /getters of authentication form
  get UserName() {
    return this.addAdminAuthForm.get('UserName');
  }
  get VerificationCode() {
    return this.addAdminAuthForm.get('VerificationCode');
  }
  get Password() {
    return this.addAdminAuthForm.get('Password');
  }
  get ConfirmPassword() {
    return this.addAdminAuthForm.get('ConfirmPassword');
  }
  get adminAuthParameter() {
    return this.addAdminAuthForm.controls;
  }

  // addAdminForm /getters of Create Admin form
  get LastName() {
    return this.addAdminForm.get('LastName');
  }
  get EmailId() {
    return this.addAdminForm.get('EmailId');
  }
  get PhoneNumber() {
    return this.addAdminForm.get('PhoneNumber');
  }
  get Age() {
    return this.addAdminForm.get('Age');
  }
  get Role() {
    return this.addAdminForm.get('Role');
  }
  get Level() {
    return this.addAdminForm.get('Level');
  }
  get Country() {
    return this.addAdminForm.get('Country');
  }
  get Zone() {
    return this.addAdminForm.get('Zone');
  }
  get State() {
    return this.addAdminForm.get('State');
  }
  get FirstName() {
    return this.addAdminForm.get('FirstName');
  }
  get Location() {
    return this.addAdminForm.get('Location');
  }
  get adminParameter() {
    return this.addAdminForm.controls;
  }
  get Fir() {
    return this.addAdminForm.get('Fir');
  }
  get Maplayer() {
    return this.addAdminForm.get('Maplayer');
  }

  //On click of country dropdown
  countryChange(event) {
    if (event !== '' && event !== undefined) {
      let payloadSearch = this.countryApiData.find(
        (elem) => elem.name == event
      );
      let payload = {
        CountryCode: payloadSearch.isoCode,
      };
      this.stateArr = [];
      this.cityArr = [];
      this.addAdminForm.patchValue({
        State: '',
        Zone: '',
        Fir: '',
        Maplayer: '',
        Location: event,
      });
      //API to get country and state
      this.authorityApi.getCountryState(payload).then(
        (res) => {
          let stateRecevied = res['data']?.MainData;
          this.stateApiData = res['data']?.MainData;
          stateRecevied = stateRecevied.map((state) => {
            return state.name;
          });
          this.stateArr = stateRecevied;
        },
        (err) => {}
      );
      //API to get Fir and Maplayers
      this.authorityApi.getFirMaplayers(payload).then(
        (res) => {
          this.mapLayersApiData = res['data']?.MainData.MapLayers;
          this.firApiData = res['data']?.MainData.FirId;
          if (this.firApiData.length > 0) {
            this.firArr = this.firApiData.map((fir) => {
              return fir.firName;
            });
          }
          if (this.mapLayersApiData.length > 0) {
            this.mapLayerArr = this.mapLayersApiData;
            this.selectedMapLayer = this.mapLayersApiData;
          }
        },
        (err) => {}
      );
    } else {
      //If country change resset state and city
      this.addAdminForm.patchValue({
        State: '',
        Country: '',
        Zone: '',
        Fir: '',
        Maplayer: '',
      });
      this.stateArr = [];
      this.cityArr = [];
      this.mapLayerArr = [];
    }
  }

  //On click of state dropdown
  stateChange(event) {
    this.cityArr = [];
    this.addAdminForm.patchValue({
      Zone: '',
      Fir: '',
    });
    if (event !== '' && event !== undefined) {
      if (this.addAdminForm.value.Country !== 'Ireland') {
        ///old api call/ match perticular country and genrates payload
        let payloadSearch = this.stateApiData.find(
          (elem) => elem.name == event
        );
        let payload = {
          CountryCode: payloadSearch.countryCode,
          StateCode: payloadSearch.isoCode,
        };
        //Api To get Cities of that state
        this.authorityApi.getCountryState(payload).then(
          (res) => {
            let cityRecevied = res['data']?.MainData;
            cityRecevied = cityRecevied.map((elem) => {
              return elem.name;
            });
            this.cityArr = cityRecevied;
          },
          (err) => {}
        );
      } else {
        //api for ireland
        let payload = {
          State: event,
        };
        //to get the cities of Ireland country
        this.authorityApi.getCityOnly(payload).then(
          (res) => {
            let cityRecevied = res['data']?.MainData;
            this.cityArr = cityRecevied;
          },
          (err) => {}
        );
      }
      //hiding Fir dropdown if state selected
      this.firDropdownFlag = true;
    } else {
      this.addAdminForm.patchValue({
        Zone: '',
      });
      this.cityArr = [];
      //hiding Fir dropdown if state selected
      this.firDropdownFlag = false;
    }
  }

  //on click of FIR dropdown
  firChange(event) {
    if (event !== '' && event !== undefined) {
      this.stateDropdownFlag = true;
    } else {
      this.addAdminForm.patchValue({
        Fir: '',
        State: '',
        Zone: '',
        Maplayer: '',
      });
      this.stateDropdownFlag = false;
    }
  }

  //on click of level dropdown
  levelChange(event) {
    // console.log(event)
  }
  //on click of filter dropdown
  filterLevelChange(e) {
    if (e.target.value !== '') {
      this.getAuthoritiesDetailsData = this.rawData.filter(
        (data) => data.Level === e.target.value
      );
    }
  }
  //to check wheater pwd is matched or not
  confirmPasswordChange(event) {
    if (event.target.value !== this.addAdminAuthForm.value.Password) {
      this.pwdMismatch = true;
    } else {
      this.pwdMismatch = false;
    }
  }
  //for modelref2
  addAdminAuth(addAdmin) {
    this.modalRef2 = this.modalService.show(addAdmin, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
  }
  //Cancel AuthenticateCode Verfication form
  cancelAddAdminAuth() {
    this.addAdminAuthForm.reset();
    this.modalRef.hide();
    this.submitted = false;
    this.toggleForm = !this.toggleForm;
  }

  //On submit of create admin form
  addAdminSubmit() {
    this.submitted = true;
    this.addAdminForm.patchValue({
      Location: this.addAdminForm.get('Country').value,
    });
    if (this.addAdminForm.valid) {
      //will remove
      if (this.addAdminForm.value.Maplayer.length == 0) {
        this.addAdminForm.patchValue({
          Maplayer: [
            'GeoZone',
            'FIC',
            'NoFlyZone',
            'InnerYellowZone',
            'OuterYellowZone',
          ],
        });
      }
      this.loader = true;
      let payload = {
        ...this.addAdminForm.value,
      };
      let countryName = payload.Country;
      let countryIsoCode = this.countryApiData.find(
        (elem) => elem.name == countryName
      );
      payload.Country = {
        Name: countryName,
        IsoCode: countryIsoCode.isoCode,
      };
      payload.MapLayers = {
        Layers: payload.Maplayer,
      };
      delete payload['Maplayer'];
      payload.District = {
        Name: payload.Zone,
        IsoCode: payload.Zone,
      };
      delete payload['Zone'];
      if (
        this.addAdminForm.value.Fir !== '' &&
        this.addAdminForm.value.Fir !== null &&
        this.addAdminForm.value.Fir !== undefined
      ) {
        let firName = payload.Fir;
        let firIsoCode = this.firApiData.find(
          (elem) => elem.firName == firName
        );
        payload.FIR = {
          Name: payload.Fir,
          IsoCode: firIsoCode.firId,
        };
        delete payload['Fir'];
      }

      if (
        this.addAdminForm.value.State !== '' &&
        this.addAdminForm.value.State !== null &&
        this.addAdminForm.value.State !== undefined
      ) {
        let stateName = payload.State;
        let stateIsoCode = this.stateApiData.find(
          (elem) => elem.name == stateName
        );
        payload.State = {
          Name: stateName,
          IsoCode: stateIsoCode.isoCode,
        };
      }
      //API to create Authority user or Regulators user.
      this.authorityApi.getAuthorityAdminRegistration(payload).then(
        (res) => {
          this.loader = false;
          //user-already-exists
          if (res['data']?.MainData == 'email or phone already exist') {
            this.submitted = false;
            this.showSwal('user-already-exists', 'optional');
            //  this.addAdminForm.reset();
            //  this.modalRef.hide();
          }
          //go-for-registration
          else {
            this.submitted = false;
            this.toggleForm = !this.toggleForm;
            this.addAdminForm.reset();
            // this.modalRef.hide();
          }
        },
        (err) => {
          this.loader = false;
        }
      );
      // this.modalService.hide();
    }
  }

  //On submit of Authntication/ Code Verfication form
  addAdminAuthSubmit() {
    this.submitted = true;
    if (
      this.addAdminAuthForm.value.ConfirmPassword !==
      this.addAdminAuthForm.value.Password
    ) {
      this.pwdMismatch = true;
    } else {
      this.pwdMismatch = false;
    }
    if (this.pwdMismatch !== true) {
      if (this.addAdminAuthForm.valid) {
        this.loader = true;
        let payload = {
          ...this.addAdminAuthForm.value,
        };
        delete payload.ConfirmPassword;
        this.authorityApi.getResetPassword(payload).then(
          (res) => {
            this.loader = false;
            if (res['data']?.MainData == 'Password reset success') {
              this.toggleForm = true;
              this.addAdminAuthForm.reset();
              this.modalRef.hide();
              this.showSwal('Password reset success', 'optional');
            }
          },
          (err) => {
            this.showSwal(
              'passwordresetSuccessErr',
              err?.error?.error?.message
            );
          }
        );
      }
    }
  }

  // Alert/Confirmation and Pop-up  methods
  showSwal(type, UserId) {
    if (type == 'user-already-exists') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'info',
          background: '#1b1f27',
          title: `Admin already exists`,
          text: `Phone no. or Email already exists`,
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
    if (type == 'Password reset success') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Admin created successfully`,
          text: `Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.initialApiCall();
          }
        });
    }
    if (type == 'passwordresetSuccessErr') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'error',
          background: '#1b1f27',
          title: `Error`,
          text: UserId,
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
    if (type == 'Authority Updated Successfully') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Admin Updated Successfully`,
          // text:`Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.initialApiCall();
          }
        });
    }
    if (type == 'updateAuthoritiesErr') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'error',
          background: '#1b1f27',
          title: `Error`,
          text: UserId,
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
    if (type == 'Are you sure you want to delete this Admin') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'warning',
          background: '#1b1f27',
          title: `Are you sure you want to delete this Admin?`,
          text: `This action cannot be undone.`,
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.deleteAuthoritiesCall(UserId);
          }
          if (result.isDismissed) {
          }
        });
    }
    if (type == 'Authority deleted successfully') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'success',
          background: '#1b1f27',
          title: `Admin deleted successfully`,
          // text:`Password reset successfully`,
          focusConfirm: false,
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.initialApiCall();
          }
        });
    }
    if (type == 'deleteAuthoritiesErr') {
      this.swalWithBootstrapButtons
        .fire({
          icon: 'error',
          background: '#1b1f27',
          title: `Error`,
          text: UserId,
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

  //ON click of Edit button
  async editAuthorities(authoritiesData, model) {
    this.stateArr = [];
    this.cityArr = [];
    this.submitted = true;
    this.editFlag = true;
    //Open Form for editing
    this.modalRef = this.modalService.show(model, {
      class: 'modal-dialog-centered gray',
      backdrop: 'static',
      keyboard: false,
    });
    //Pre-filled the form with existing data
    this.addAdminForm.patchValue({
      FirstName: authoritiesData.FirstName,
      LastName: authoritiesData.LastName,
      EmailId: authoritiesData.EmailId,
      Age: authoritiesData.Age,
      PhoneNumber: authoritiesData.PhoneNumber,
      Role: authoritiesData.Role,
      Level: authoritiesData.Level,
      // Country: authoritiesData?.LevelMap?.CountryName?.Name,
      Country: authoritiesData?.LevelMap?.Country?.Name,
      State: authoritiesData.LevelMap?.State?.Name,
      Zone: authoritiesData.LevelMap?.CountryName?.StateName?.ZoneName?.Name,
      Location: '',
      UserId: authoritiesData.UserId,
      Fir: authoritiesData.LevelMap?.FIR?.Name,
    });
    this.titleName = authoritiesData.FirstName + ' ' + authoritiesData.LastName;
    //Get States
    let payloadSearch = this.countryApiData.find(
      (elem) => elem.name == authoritiesData?.LevelMap?.Country?.Name
    );
    let payload = {
      CountryCode: payloadSearch.isoCode,
    };
    // let payload = {
    //   'Country': authoritiesData?.LevelMap?.CountryName?.Name,
    // }
    //get country/state/city
    this.authorityApi.getCountryState(payload).then(
      async (res) => {
        let stateRecevied = res['data']?.MainData;
        this.stateApiData = res['data']?.MainData;
        stateRecevied = stateRecevied.map((state) => {
          return state.name;
        });
        this.stateArr = stateRecevied;

        if (this.addAdminForm.value.Country !== 'Ireland') {
          //Get City
          let stateName = authoritiesData.LevelMap?.State?.Name;
          let payloadSearch2 = this.stateApiData.find(
            (elem) => elem.name == stateName
          );
          if (payloadSearch2 != undefined) {
            let payload2 = {
              CountryCode: payloadSearch2.CountryCode,
              StateCode: payloadSearch2.isoCode,
            };
            //API for country/state/city
            this.authorityApi.getCountryState(payload2).then(
              (res) => {
                let cityRecevied = res['data']?.MainData;
                cityRecevied = cityRecevied.map((elem) => {
                  return elem.name;
                });
                this.cityArr = cityRecevied;
              },
              (err) => {}
            );
          }

          this.cityArr = [];
        } else {
          //api for ireland
          let stateName = authoritiesData.LevelMap?.State?.Name;
          let payload = {
            State: stateName,
          };
          this.authorityApi.getCityOnly(payload).then(
            (res) => {
              let cityRecevied = res['data']?.MainData;
              this.cityArr = cityRecevied;
            },
            (err) => {}
          );
        }
      },
      (err) => {}
    );

    // //API to get Fir and Maplayers
    this.authorityApi.getFirMaplayers(payload).then(
      (res) => {
        this.mapLayersApiData = res['data']?.MainData.MapLayers;
        this.firApiData = res['data']?.MainData.FirId;
        if (this.firApiData.length > 0) {
          this.firArr = this.firApiData.map((fir) => {
            return fir.firName;
          });
        }
        if (this.mapLayersApiData.length > 0) {
          this.mapLayerArr = this.mapLayersApiData;
          this.selectedMapLayer = this.mapLayersApiData;
        }
      },
      (err) => {}
    );
  }

  //Method to Update Authority/ Regulators or Edit
  editAuthoritiesCall() {
    this.addAdminForm.get('PhoneNumber').clearValidators();
    this.addAdminForm.get('PhoneNumber').updateValueAndValidity();
    if (this.addAdminForm.valid) {
      //will remove
      if (this.addAdminForm.value.Maplayer.length == 0) {
        this.addAdminForm.patchValue({
          Maplayer: [
            'GeoZone',
            'FIC',
            'NoFlyZone',
            'InnerYellowZone',
            'OuterYellowZone',
          ],
        });
      }
      this.loader = true;
      this.addAdminForm.patchValue({
        Location: this.addAdminForm.get('Country').value,
      });
      let payload = {
        ...this.addAdminForm.value,
      };
      let countryName = payload.Country;
      let countryIsoCode = this.countryApiData.find(
        (elem) => elem.name == countryName
      );
      payload.Country = {
        Name: countryName,
        IsoCode: countryIsoCode.isoCode,
      };

      payload.MapLayers = {
        Layers: payload.Maplayer,
      };
      delete payload['Maplayer'];
      payload.District = {
        Name: payload.Zone,
        IsoCode: payload.Zone,
      };
      delete payload['Zone'];
      if (
        this.addAdminForm.value.Fir !== '' &&
        this.addAdminForm.value.Fir !== null &&
        this.addAdminForm.value.Fir !== undefined
      ) {
        let firName = payload.Fir;
        let firIsoCode = this.firApiData.find(
          (elem) => elem.firName == firName
        );
        payload.FIR = {
          Name: payload.Fir,
          IsoCode: firIsoCode.firId,
        };
        delete payload['Fir'];
      }

      if (
        this.addAdminForm.value.State !== '' &&
        this.addAdminForm.value.State !== null &&
        this.addAdminForm.value.State !== undefined
      ) {
        let stateName = payload.State;
        let stateIsoCode = this.stateApiData.find(
          (elem) => elem.name == stateName
        );
        payload.State = {
          Name: stateName,
          IsoCode: stateIsoCode.isoCode,
        };
      }
      // delete payload.ConfirmPassword;
      //API to update Authority or Regulator
      this.authorityApi.getUpdateAdminDetails(payload).then(
        (res) => {
          this.loader = false;
          if (res['data']?.MainData == 'Authority Updated Successfully') {
            this.addAdminForm.reset();
            this.modalRef.hide();
            //Confirmation Alert
            this.showSwal('Authority Updated Successfully', 'optional');
          }
        },
        (err) => {
          //Fail Alert
          this.showSwal('updateAuthoritiesErr', err?.error?.error?.message);
        }
      );
    }
  }

  //Confirmation before deleting an existing Authority or Regulator user
  deleteAuthorities(authoritiesData) {
    this.showSwal(
      'Are you sure you want to delete this Admin',
      authoritiesData.UserId
    );
  }

  //ON click of Delete Authority button
  deleteAuthoritiesCall(authoritiesData) {
    this.loader = true;
    let payload = {
      UserId: authoritiesData,
    };
    //Dleete API
    this.authorityApi.getDeleteAdminDetails(payload).then(
      (res) => {
        this.loader = false;
        if (res['data']?.MainData == 'Authority deleted successfully') {
          this.showSwal('Authority deleted successfully', 'optional');
        }
      },
      (err) => {
        this.showSwal('deleteAuthoritiesErr', err?.error?.error?.message);
      }
    );
  }

  //Search
  searchByOnSelect(e) {
    this.searchByFlag = true;
    this.getAuthoritiesDetailsData = this.rawData;
    this.getAuthoritiesDetailsData = this.getAuthoritiesDetailsData.filter(
      (data) => {
        return data.UserId == e.item.UserId ? data : null;
      }
    );
  }
  //clear Search or reset
  clearSearch() {
    this.selected = '';
    this.searchByFlag = false;
    this.getAuthoritiesDetailsData = this.rawData;
    this.selectedOption = '';
  }
  onKeyDownEvent(e) {
    if (e.keyCode == 13) {
      this.onSearchKeyWord();
    }
  }
  //on key press to search perticular authority or regulator from search bar
  onSearchKeyWord() {
    this.searchByFlag = true;
    this.getAuthoritiesDetailsData = this.rawData;
    let fileteredArr = this.authoritySearchBy
      .filter((data) => {
        return data.custom.toLowerCase().includes(this.selected.toLowerCase());
      })
      .map((data) => {
        return data.UserId;
      });
    this.getAuthoritiesDetailsData = this.getAuthoritiesDetailsData.filter(
      (data) => {
        return fileteredArr.includes(data.UserId);
      }
    );
  }
  //trackByFlag
  trackByUserId(index: number, authoritiesData: any): string {
    return authoritiesData.UserId;
  }
}
