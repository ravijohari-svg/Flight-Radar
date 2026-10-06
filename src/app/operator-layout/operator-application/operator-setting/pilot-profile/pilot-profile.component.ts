import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import Swal from 'sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';

@Component({
  selector: 'app-pilot-profile',
  templateUrl: './pilot-profile.component.html',
  styleUrls: ['./pilot-profile.component.scss'],
})
export class PilotProfileComponent implements OnInit {
  //Modal
  modalRef: BsModalRef;
  modalRef2: BsModalRef;
  otpValue;

  //Profile Details
  profileDetails;
  verifiyAfterSubmit: boolean = false;
  sendOTP: boolean = false;
  verifyOTP: boolean = false;
  resendOTP: boolean = false;
  invalidOTP: boolean = false;
  whatsappLoader: boolean = false;
  @ViewChild('otp1') otp1Input!: ElementRef;
  @ViewChild('otp2') otp2Input!: ElementRef;
  @ViewChild('otp3') otp3Input!: ElementRef;
  @ViewChild('otp4') otp4Input!: ElementRef;
  @ViewChild('otp5') otp5Input!: ElementRef;
  @ViewChild('otp6') otp6Input!: ElementRef;
  sureExit: boolean = false;
  fillArea: number = 1;
  //Loader
  loader;

  //api response
  response;


  //submitted
  submitted = false;
  firstLetter: String = '';
  secondLetter: String = '';

  //Drop Down Dummy Data
  countryArr;
  countryList;
  CountryCode;

  //Form Fields
  pilotProfileForm: FormGroup;
  basicDetails: FormGroup;

  // Documents
  kmlFileName = '';
  kmlFileName1 = '';
  kmlFileName2 = '';
  kmlFileName3 = '';
  kmlFileName4 = '';
  kmlFileName5 = '';
  document1FileName = '';
  document2FileName = '';
  document3FileName = '';
  documentsArr = [];

  //Error Messages
  regErrMessage;
  fileSizeError;
  fileSizeError1;
  fileSizeError2;
  fileSizeError3;
  fileSizeError4;
  fileSizeError5;
  kmlFileSizeError: boolean = false;
  kmlFileSizeError1: boolean = false;
  kmlFileSizeError2: boolean = false;
  kmlFileSizeError3: boolean = false;
  kmlFileSizeError4: boolean = false;
  kmlFileSizeError5: boolean = false;
  document1FileSizeError = false;
  document2FileSizeError = false;
  document3FileSizeError = false;
  editable = false;
  deletedDocumentType = '';
  sizeGreater: boolean = false;
  sizeGreater1: boolean = false;
  sizeGreater2: boolean = false;
  sizeGreater3: boolean = false;
  sizeGreater4: boolean = false;
  sizeGreater5: boolean = false;

  // upcoming documents
  kmlFileUrl = '';
  kmlFileUrl1 = '';
  kmlFileUrl2 = '';
  kmlFileUrl3 = '';
  kmlFileUrl4 = '';
  kmlFileUrl5 = '';
  kmlFileUrlFlag: boolean = false;
  kmlFileUrlFlag1: boolean = false;
  kmlFileUrlFlag2: boolean = false;
  kmlFileUrlFlag3: boolean = false;
  kmlFileUrlFlag4: boolean = false;
  kmlFileUrlFlag5: boolean = false;
  document1Url;
  document1UrlFlag;
  document2Url;
  document2UrlFlag;
  document3Url;
  document3UrlFlag;
  //Dynamic field count1
  addFieldCount = 0;
  //name of document
  documentOneName = '';
  documentTwoName = '';
  documentThreeName = '';
  myForm: FormGroup;

  //swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger
    },
    buttonsStyling: false,
  });

  //Alert
  showSwal(type, option1?, option2?) {
    if (type == 'updated-successfully') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Profile updated successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: true,
          allowOutsideClick: false,
          // timer: 1000,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.formCancel();
            this.editable = false;
            this.initialFunction();
          }
        });
    }
    if (type == 'Document deleted successfully') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Document deleted successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: true,
          allowOutsideClick: false,
          // timer: 1000,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.formCancel();
            this.editable = false;
            this.initialFunction();
          }
        });
    }
  }
  //Confirm Alert
  showConfirmSwal(data, index) {
    this.swalWithBootstrapButtons
      .fire({
        icon: 'warning',
        background: '#1b1f27',
        title: `Are you sure you want to delete this document?`,
        text: `This action cannot be undone.`,
        focusConfirm: false,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.deleteKMLFile(data, index);
        }
      });
  }
  constructor(
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private dateAndTimeFormat: DateTimeFormatService,
    private modalService: BsModalService,
    private router: Router,
    private webSocketService: WebSocketService,
    private operatorService: OperatorService
  ) {}
  ngOnInit(): void {
    this.initialFunction();
  }
  //Contain those functionality needed at first run of this component
  initialFunction() {
    //API to get countries
    this.operatorapi.getCountryList().then((res: any) => {
      this.countryList = res.data.MainData;
      this.countryArr = this.countryList.map((val) => (val = val.name));
    });
    //Building Form
    this.basicDetails = this.fb.group({
      fullName: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        this.textOnlyValidator(),
        Validators.pattern('^(?!\\s)(?=.*\\S)[a-zA-Z\\s]+(?<!\\s)$'), // Ensuring no spaces using pattern
      ]),
      emailID: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.email,
      ]),
      phoneNumber: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        // Validators.minLength(10),
        // Validators.maxLength(10),
        // Validators.pattern('^[0-9]*$'),
        Validators.pattern('^[0-9]{12}$'),
      ]),
      dateOfBirth: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        ageCalculator(),
      ]),
      country: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      countryCode: new FormControl(''),
      certificationType: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      //kmlFile
      kmlFile: new FormControl(''),
      kmlFileType: new FormControl(''),
      //kmlFile
      kmlFile1: new FormControl(''),
      kmlFileType1: new FormControl(''),
      kmlFile2: new FormControl(''),
      kmlFileType2: new FormControl(''),
      kmlFile3: new FormControl(''),
      kmlFileType3: new FormControl(''),
      kmlFile4: new FormControl(''),
      kmlFileType4: new FormControl(''),
      kmlFile5: new FormControl(''),
      kmlFileType5: new FormControl(''),
    });

    //Getting profile information
    // let decrypt = CryptoJS.AES.decrypt(
    //   localStorage.getItem('UserDetails').toString(),
    //   environment.operatorKey
    // );

    // this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    this.profileDetails = this.operatorService.returnProfileDetails();
    if (this.profileDetails) {
      this.basicDetails.patchValue({
        fullName: this.profileDetails?.FirstName,
        emailID: this.profileDetails?.EmailId,
        dateOfBirth: this.profileDetails?.DOB
          ? new Date(this.profileDetails?.DOB)
          : '',
        country: this.profileDetails?.Country,
        countryCode: this.profileDetails?.CountryCode,
        phoneNumber: this.profileDetails?.PhoneNumber,
        certificationType: this.profileDetails?.Certification,
      });
      this.documentsExistChecker();
    }
    this.getCharacter();
    this.getFilled();
    this.whatsappVerification();
    this.getConicGradient();
  }
  //Form Controls
  get firstName() {
    return this.basicDetails.get('firstName');
  }
  get phoneNumber() {
    return this.basicDetails.get('phoneNumber');
  }
  get emailID() {
    return this.basicDetails.get('emailID');
  }
  get certificationType() {
    return this.basicDetails.get('certificationType');
  }
  get country() {
    return this.basicDetails.get('country');
  }
  get dateOfBirth() {
    return this.basicDetails.get('dateOfBirth');
  }
  get kmlFile() {
    return this.basicDetails.get('kmlFile');
  }
  get kmlFileType() {
    return this.basicDetails.get('kmlFileType');
  }
  get kmlFile1() {
    return this.basicDetails.get('kmlFile1');
  }
  get kmlFileType1() {
    return this.basicDetails.get('kmlFileType1');
  }
  get kmlFile2() {
    return this.basicDetails.get('kmlFile2');
  }
  get kmlFileType2() {
    return this.basicDetails.get('kmlFileType2');
  }
  get kmlFile3() {
    return this.basicDetails.get('kmlFile3');
  }
  get kmlFileType3() {
    return this.basicDetails.get('kmlFileType3');
  }
  get kmlFile4() {
    return this.basicDetails.get('kmlFile4');
  }
  get kmlFileType4() {
    return this.basicDetails.get('kmlFileType4');
  }
  get kmlFile5() {
    return this.basicDetails.get('kmlFile5');
  }
  get kmlFileType5() {
    return this.basicDetails.get('kmlFileType5');
  }

  get basic() {
    return this.basicDetails.controls;
  }

  //On click of cancel button
  formCancel() {
    this.editable = !this.editable;
    this.basicDetails.controls.fullName.disable();
    this.basicDetails.controls.dateOfBirth.disable();
    this.basicDetails.controls.country.disable();
    this.basicDetails.controls.certificationType.disable();
  }
  textOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return { textOnly: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }
  //documents already exists or not available
  documentsExistChecker() {
    if (
      this.profileDetails.waypoints &&
      this.profileDetails?.waypoints.length !== 0
    ) {
      this.profileDetails?.waypoints.forEach((element, index) => {
        if (index === 0) {
          this.kmlFileName = Object.keys(element)[0];
          let kmltype = '';
          if (this.kmlFileName.endsWith('.kml')) {
            kmltype = 'kml';
          } else {
            kmltype = 'waypoints';
          }
          this.kmlFileUrl = element[this.kmlFileName];
          this.basicDetails.patchValue({
            kmlFile: 'Already',
            kmlFileType: kmltype,
          });
          this.kmlFileUrlFlag = true;
        } else if (index === 1) {
          this.kmlFileName1 = Object.keys(element)[0];
          let kmltype1 = '';
          if (this.kmlFileName1.endsWith('.kml')) {
            kmltype1 = 'kml';
          } else {
            kmltype1 = 'waypoints';
          }
          this.kmlFileUrl1 = element[this.kmlFileName1];
          this.basicDetails.patchValue({
            kmlFile1: 'Already',
            kmlFileType1: kmltype1,
          });
          this.kmlFileUrlFlag1 = true;
        } else if (index === 2) {
          let kmltype2 = '';
          this.kmlFileName2 = Object.keys(element)[0];
          if (this.kmlFileName2.endsWith('.kml')) {
            kmltype2 = 'kml';
          } else {
            kmltype2 = 'waypoints';
          }
          this.kmlFileUrl2 = element[this.kmlFileName2];
          this.basicDetails.patchValue({
            kmlFile2: 'Already',
            kmlFileType2: kmltype2,
          });
          this.kmlFileUrlFlag2 = true;
        } else if (index === 3) {
          let kmltype3 = '';
          this.kmlFileName3 = Object.keys(element)[0];
          if (this.kmlFileName3.endsWith('.kml')) {
            kmltype3 = 'kml';
          } else {
            kmltype3 = 'waypoints';
          }
          this.kmlFileUrl3 = element[this.kmlFileName3];
          this.basicDetails.patchValue({
            kmlFile3: 'Already',
            kmlFileType3: kmltype3,
          });
          this.kmlFileUrlFlag3 = true;
        } else if (index === 4) {
          let kmltype4 = '';
          this.kmlFileName4 = Object.keys(element)[0];
          if (this.kmlFileName4.endsWith('.kml')) {
            kmltype4 = 'kml';
          } else {
            kmltype4 = 'waypoints';
          }
          this.kmlFileUrl4 = element[this.kmlFileName4];
          this.basicDetails.patchValue({
            kmlFile4: 'Already',
            kmlFileType4: kmltype4,
          });
          this.kmlFileUrlFlag4 = true;
        } else if (index === 5) {
          let kmltype5 = '';
          this.kmlFileName5 = Object.keys(element)[0];
          if (this.kmlFileName5.endsWith('.kml')) {
            kmltype5 = 'kml';
          } else {
            kmltype5 = 'waypoints';
          }
          this.kmlFileUrl5 = element[this.kmlFileName5];
          this.basicDetails.patchValue({
            kmlFile5: 'Already',
            kmlFileType5: kmltype5,
          });
          this.kmlFileUrlFlag5 = true;
        }
      });
    }
  }
  documentsPayloadFormer() {
    this.documentsArr = [];
    if (this.basicDetails.value.kmlFile !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName,
        Data: this.basicDetails.value.kmlFile, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType,
      });
    }
    if (this.basicDetails.value.kmlFile1 !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName1,
        Data: this.basicDetails.value.kmlFile1, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType1,
      });
    }
    if (this.basicDetails.value.kmlFile2 !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName2,
        Data: this.basicDetails.value.kmlFile2, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType2,
      });
    }
    if (this.basicDetails.value.kmlFile3 !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName3,
        Data: this.basicDetails.value.kmlFile3, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType3,
      });
    }
    if (this.basicDetails.value.kmlFile4 !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName4,
        Data: this.basicDetails.value.kmlFile4, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType4,
      });
    }
    if (this.basicDetails.value.kmlFile5 !== '') {
      this.documentsArr.push({
        Name: this.kmlFileName5,
        Data: this.basicDetails.value.kmlFile5, // base64 encoded document
        FileType: this.basicDetails.value.kmlFileType5,
      });
    }
  }
  //On click of confirm details button
  async formSumbit() {
    let date = this.convertDate(this.basicDetails.value.dateOfBirth)
    this.submitted = true;
    this.CountryCode = this.countryList.find(
      (val) => this.basicDetails.value.country == val.name
    )?.code;
    if (this.basicDetails.valid && this.CountryCode) {
      this.loader = true;
      //disabled filed doesn't show in the form
      this.basicDetails.controls.emailID.enable();
      // this.basicDetails.controls.phoneNumber.enable();
      let payload: any = {
        UserId: this.profileDetails.UserId,
        FirstName: this.basicDetails.value.fullName,
        LastName: this.basicDetails.value.fullName,
        // EmailId: this.basicDetails.value.emailID.toLowerCase(),
        // PhoneNumber: '91' + String(this.basicDetails.value.phoneNumber),
        PhoneNumber: this.basicDetails.value.phoneNumber,
        // DOB: this.dateAndTimeFormat.dateAndTimeFormatting(
        //   new Date(this.basicDetails.value.dateOfBirth),
        //   'date'
        // ),
        DOB: date,
        Country: this.basicDetails.value.country,
        CountryCode: this.CountryCode,
        Certification: this.basicDetails.value.certificationType,
      };
      this.documentsPayloadFormer();
      if (this.documentsArr.length !== 0) {
        payload.waypoints = this.documentsArr;
      }
      this.basicDetails.controls.emailID.disable();
      this.basicDetails.controls.phoneNumber.disable();
      this.editableForm();
      // this.operatorapi.updateProfileDetails(payload).then(
      //   (res) => {
      //     this.submitted = false;
      //     this.loader = false;
      //     let payloads={
      //         UserId: this.profileDetails?.EmailId,
      //     }
      //     this.operatorapi.getProfileDetails(payloads).then(
      //       (res: any) => {
      //         this.response = res.data.MainData;
      //         this.verifiyAfterSubmit = false;
      //         let encryData = CryptoJS.AES.encrypt(
      //           JSON.stringify(this.response),
      //           environment.operatorKey
      //         );
      //          localStorage.setItem('UserDetails', encryData);
      //         this.operatorApplicationComponent.getUpdateDecrypt(
      //           this.response
      //         );
      //         this.loader = false;
      //       },
      //       (err) => {
      //         this.loader = false;
      //       }
      //     );
      //     this.showSwal('updated-successfully');
      //     this.getConicGradient();
      //     this.documentsArr = [];
      //   },
      //   (err) => {
      //     this.documentsArr = [];
      //     this.loader = false;
      //     this.regErrMessage = err.error.error.message;
      //   }
      // );
      // api converted into async await
      try {
        const updateResponse = await this.operatorapi.updateProfileDetails(
          payload
        );
        this.submitted = false;
        this.loader = false;
        let payloads = {
          UserId: this.profileDetails?.EmailId,
        };
        const profileResponse = await this.operatorapi.getProfileDetails(
          payloads
        );
        this.response = profileResponse.data.MainData;
        this.verifiyAfterSubmit = false;
        let encryData = CryptoJS.AES.encrypt(
          JSON.stringify(this.response),
          environment.operatorKey
        );
        localStorage.setItem('UserDetails', encryData);
        this.loader = false;
        this.showSwal('updated-successfully');
        this.getConicGradient();
        this.documentsArr = [];
      } catch (err) {
        this.documentsArr = [];
        this.loader = false;
        this.regErrMessage = err.error.error.message;
      }
    }
  }
  convertDate(dateString) {
    let date = new Date(dateString);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // Format day and month with leading zeros if necessary
    let dayStr = day < 10 ? '0' + day : day.toString();
    let monthStr = month < 10 ? '0' + month : month.toString();

    return `${dayStr}-${monthStr}-${year}`;
}
  //delete API call
  deleteUploadedDocuments() {
    this.addFieldCount = 0;
    if (
      this.profileDetails?.Documents.length !== 0 &&
      this.deletedDocumentType !== ''
    ) {
      let deletedDocumentID;
      this.profileDetails?.Documents.forEach((element) => {
        if (element.documentType == this.deletedDocumentType) {
          deletedDocumentID = element.id;
        }
      });
      this.loader = true;
      let payload = {
        UserId: this.profileDetails?.UserId,
        DocumentId: deletedDocumentID,
      };
      this.operatorapi.deleteUploadedDocuments(payload).then(
        (res) => {
          this.loader = false;
          let responseFlag = res['data']?.Message;
          this.showSwal('Document deleted successfully');
          this.response = res['data']?.MainData;
          this.submitted = false;
          this.loader = false;
          //need to sotre the new profile details in local storage
          let encryData = CryptoJS.AES.encrypt(
            JSON.stringify(this.response),
            environment.operatorKey
          );
          localStorage.setItem('UserDetails', encryData);
          this.profileDetails = this.operatorService.returnProfileDetails();
          this.showSwal('updated-successfully');
          this.documentsArr = [];
        },
        (err) => {
          this.loader = false;
          this.regErrMessage = err.error.error.message;
        }
      );
    }
  }
  //On click of kml field
  kmlFileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater = true;
      this.kmlFileSizeError = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater = false;
        this.kmlFileSizeError = false;
        this.kmlFileUrlFlag = true;
        this.kmlFileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile: splitArr[1],
            kmlFileType: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater = false;
        this.kmlFileSizeError = false;
        this.kmlFileUrlFlag = true;
        this.kmlFileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile: splitArr[1],
            kmlFileType: 'waypoints',
          });
        });
      } else {
        this.fileSizeError = true;
        this.kmlFileSizeError = true;
      }
    }
  }
  //On click of kml field
  kmlFileUploads1(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater1 = true;
      this.kmlFileSizeError1 = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater1 = false;
        this.kmlFileSizeError1 = false;
        this.kmlFileUrlFlag1 = true;
        this.kmlFileName1 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile1: splitArr[1],
            kmlFileType1: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater1 = false;
        this.kmlFileSizeError1 = false;
        this.kmlFileUrlFlag1 = true;
        this.kmlFileName1 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile1: splitArr[1],
            kmlFileType1: 'waypoints',
          });
        });
      } else {
        this.fileSizeError1 = true;
        this.kmlFileSizeError1 = true;
      }
    }
  }
  //On click of kml field
  kmlFileUploads2(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater2 = true;
      this.kmlFileSizeError = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater2 = false;
        this.kmlFileSizeError2 = false;
        this.kmlFileUrlFlag2 = true;
        this.kmlFileName2 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile2: splitArr[1],
            kmlFileType2: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater2 = false;
        this.kmlFileSizeError2 = false;
        this.kmlFileUrlFlag2 = true;
        this.kmlFileName2 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile2: splitArr[1],
            kmlFileType2: 'waypoints',
          });
        });
      } else {
        this.fileSizeError2 = true;
        this.kmlFileSizeError2 = true;
      }
    }
  }
  //On click of kml field
  kmlFileUploads3(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater3 = true;
      this.kmlFileSizeError3 = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater3 = false;
        this.kmlFileSizeError3 = false;
        this.kmlFileUrlFlag3 = true;
        this.kmlFileName3 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile3: splitArr[1],
            kmlFileType3: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater3 = false;
        this.kmlFileSizeError3 = false;
        this.kmlFileUrlFlag3 = true;
        this.kmlFileName3 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile3: splitArr[1],
            kmlFileType3: 'waypoints',
          });
        });
      } else {
        this.fileSizeError3 = true;
        this.kmlFileSizeError3 = true;
      }
    }
  }
  //On click of kml field
  kmlFileUploads4(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater4 = true;
      this.kmlFileSizeError4 = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater4 = false;
        this.kmlFileSizeError4 = false;
        this.kmlFileUrlFlag4 = true;
        this.kmlFileName4 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile4: splitArr[1],
            kmlFileType4: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater4 = false;
        this.kmlFileSizeError4 = false;
        this.kmlFileUrlFlag4 = true;
        this.kmlFileName4 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile4: splitArr[1],
            kmlFileType4: 'waypoints',
          });
        });
      } else {
        this.fileSizeError4 = true;
        this.kmlFileSizeError4 = true;
      }
    }
  }
  //On click of kml field
  kmlFileUploads5(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater5 = true;
      this.kmlFileSizeError5 = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater5 = false;
        this.kmlFileSizeError5 = false;
        this.kmlFileUrlFlag5 = true;
        this.kmlFileName5 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile5: splitArr[1],
            kmlFileType5: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater5 = false;
        this.kmlFileSizeError5 = false;
        this.kmlFileUrlFlag5 = true;
        this.kmlFileName5 = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            kmlFile5: splitArr[1],
            kmlFileType5: 'waypoints',
          });
        });
      } else {
        this.fileSizeError5 = true;
        this.kmlFileSizeError5 = true;
      }
    }
  }
  //On click of document1 field
  document1Uploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document1FileSizeError = false;
        this.document1UrlFlag = false;
        this.document1FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document1: splitArr[1],
            document1Type: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document1FileSizeError = false;
        this.document1UrlFlag = false;
        this.document1FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document1: splitArr[1],
            document1Type: 'waypoints',
          });
        });
      } else {
        this.fileSizeError = true;
        this.document1FileSizeError = true;
      }
    }
  }
  //On click of document2 field
  document2Uploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document2FileSizeError = false;
        this.document2UrlFlag = false;
        this.document2FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document2: splitArr[1],
            document2Type: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document2FileSizeError = false;
        this.document2UrlFlag = false;
        this.document2FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document2: splitArr[1],
            document2Type: 'waypoints',
          });
        });
      } else {
        this.fileSizeError = true;
        this.document2FileSizeError = true;
      }
    }
  }
  //On click of document3 field
  document3Uploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.size >= 500000) {
      this.sizeGreater = true;
    } else {
      if (file.name.endsWith('.kml') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document3FileSizeError = false;
        this.document3UrlFlag = false;
        this.document3FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document3: splitArr[1],
            document3Type: 'kml',
          });
        });
      } else if (file.name.endsWith('.waypoints') && file.size <= 500000) {
        this.sizeGreater = false;
        this.document3FileSizeError = false;
        this.document3UrlFlag = false;
        this.document3FileName = file.name;
        this.getBase64(file).then((data: any) => {
          var splitArr = data.split('base64,');
          this.basicDetails.patchValue({
            document3: splitArr[1],
            document3Type: 'waypoints',
          });
        });
      } else {
        this.fileSizeError = true;
        this.document3FileSizeError = true;
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
  //Delete kml file
  deleteKMLFile(data, index) {
    this.loader = true;
    let payload = {
      UserId: this.profileDetails.UserId,
      waypoints: [data],
    };
    this.operatorapi.deleteWaypoint(payload).then(
      (res: any) => {
        let payloads = {
          UserId: this.profileDetails.EmailId,
        };
        if (res) {
          this.operatorapi.getProfileDetails(payloads).then((res: any) => {
            let newData = res['data']?.MainData;
            //need to store the new profile details in local storage
            let encryData = CryptoJS.AES.encrypt(
              JSON.stringify(newData),
              environment.operatorKey
            );
            localStorage.setItem('UserDetails', encryData);
            this.loader = false;
          });
        }
      },
      (err: any) => {
        console.log(err);
        this.loader = false;
      }
    );
    if (index == 0) {
      this.kmlFileSizeError = false;
      this.kmlFileUrlFlag = false;
      this.kmlFileName = '';
    } else if (index == 1) {
      this.kmlFileSizeError1 = false;
      this.kmlFileUrlFlag1 = false;
      this.kmlFileName1 = '';
    } else if (index == 2) {
      this.kmlFileSizeError2 = false;
      this.kmlFileUrlFlag2 = false;
      this.kmlFileName2 = '';
    } else if (index == 3) {
      this.kmlFileSizeError3 = false;
      this.kmlFileUrlFlag3 = false;
      this.kmlFileName3 = '';
    } else if (index == 4) {
      this.kmlFileSizeError4 = false;
      this.kmlFileUrlFlag4 = false;
      this.kmlFileName4 = '';
    } else if (index == 5) {
      this.kmlFileSizeError5 = false;
      this.kmlFileUrlFlag5 = false;
      this.kmlFileName5 = '';
    }
  }
  //reset functionality
  resetKmlFile() {
    if (this.kmlFileUrlFlag) {
      this.basicDetails.patchValue({
        kmlFile: '',
        kmlFileType: '',
      });
      this.kmlFileSizeError = false;
      this.showConfirmSwal(this.kmlFileName, 0);
    } else {
      this.kmlFileUrlFlag = false;
      this.basicDetails.patchValue({
        kmlFile: '',
        kmlFileType: '',
      });
      this.kmlFileSizeError = false;
    }
  }
  resetKmlFile1() {
    if (this.kmlFileUrlFlag1) {
      this.basicDetails.patchValue({
        kmlFile1: '',
        kmlFileType1: '',
      });
      this.kmlFileSizeError1 = false;
      this.showConfirmSwal(this.kmlFileName1, 1);
    } else {
      this.basicDetails.patchValue({
        kmlFile1: '',
        kmlFileType1: '',
      });
      this.kmlFileSizeError1 = false;
      this.kmlFileUrlFlag1 = false;
    }
  }
  resetKmlFile2() {
    if (this.kmlFileUrlFlag2) {
      this.basicDetails.patchValue({
        kmlFile2: '',
        kmlFileType2: '',
      });
      this.showConfirmSwal(this.kmlFileName2, 2);
    } else {
      this.kmlFileUrlFlag2 = false;
      this.basicDetails.patchValue({
        kmlFile2: '',
        kmlFileType2: '',
      });
      this.kmlFileSizeError2 = false;
    }
  }
  resetKmlFile3() {
    if (this.kmlFileUrlFlag3) {
      this.basicDetails.patchValue({
        kmlFile3: '',
        kmlFileType3: '',
      });
      this.showConfirmSwal(this.kmlFileName3, 3);
    } else {
      this.kmlFileUrlFlag3 = false;
      this.basicDetails.patchValue({
        kmlFile3: '',
        kmlFileType3: '',
      });
      this.kmlFileSizeError3 = false;
    }
  }
  resetKmlFile4() {
    if (this.kmlFileUrlFlag4) {
      this.basicDetails.patchValue({
        kmlFile4: '',
        kmlFileType4: '',
      });
      this.showConfirmSwal(this.kmlFileName4, 4);
    } else {
      this.kmlFileUrlFlag4 = false;
      this.basicDetails.patchValue({
        kmlFile4: '',
        kmlFileType4: '',
      });
      this.kmlFileSizeError4 = false;
    }
  }
  resetKmlFile5() {
    if (this.kmlFileUrlFlag5) {
      this.basicDetails.patchValue({
        kmlFile5: '',
        kmlFileType5: '',
      });
      this.showConfirmSwal(this.kmlFileName5, 5);
    } else {
      this.kmlFileUrlFlag5 = false;
      this.basicDetails.patchValue({
        kmlFile5: '',
        kmlFileType5: '',
      });
      this.kmlFileSizeError5 = false;
    }
  }

  //On click of editable btn
  editableForm() {
    if(this.editable === false){
      this.basicDetails.controls.fullName.enable();
      this.basicDetails.controls.dateOfBirth.enable();
      this.basicDetails.controls.country.enable();
      this.basicDetails.controls.certificationType.enable();
    }
    else{
      this.basicDetails.controls.fullName.disable();
      this.basicDetails.controls.dateOfBirth.disable();
      this.basicDetails.controls.country.disable();
      this.basicDetails.controls.certificationType.disable();
    }

    // this.basicDetails.controls.phoneNumber.enable();
    this.editable = !this.editable;
  }

  ///dynamicaly creating new fields
  // createField(addField) {
  //   //Open Form
  //   this.modalRef = this.modalService.show(addField, {
  //     class: 'modal-dialog-centered gray',
  //     backdrop: 'static',
  //     keyboard: false,
  //   });
  //   if (this.addFieldCount <= 3) {
  //     if (
  //       (!this.document3Url || !this.document3.value) &&
  //       (!this.document2Url || !this.document2.value) &&
  //       (this.document1Url || !this.document1.value)
  //     ) {
  //       this.addFieldCount = 1;
  //     }
  //     if (
  //       (this.document3Url || !this.document3.value) &&
  //       (this.document2Url || this.document2.value) &&
  //       (!this.document1Url || !this.document1.value)
  //     ) {
  //       this.addFieldCount = 1;
  //     }
  //     if (
  //       (!this.document3Url || !this.document3.value) &&
  //       (!this.document2Url || !this.document2.value) &&
  //       (this.document1Url || this.document1.value)
  //     ) {
  //       this.addFieldCount = 2;
  //     }
  //     if (
  //       (this.document3Url || this.document3.value) &&
  //       (!this.document2Url || !this.document2.value) &&
  //       (this.document1Url || this.document1.value)
  //     ) {
  //       this.addFieldCount = 2;
  //     }
  //     if (
  //       (!this.document3Url || !this.document3.value) &&
  //       (this.document2Url || this.document2.value) &&
  //       (this.document1Url || this.document1.value)
  //     ) {
  //       this.addFieldCount = 3;
  //     }
  //     if (
  //       (this.document3Url || this.document3.value) &&
  //       (this.document2Url || this.document2.value) &&
  //       (!this.document1Url || !this.document1.value)
  //     ) {
  //       this.addFieldCount = 1;
  //     }

  //     // this.addFieldCount = 1 + this.addFieldCount
  //   }
  // }
  //on cancel button click
  onCancel() {
    this.modalRef.hide();
    if (this.addFieldCount <= 3) {
      this.addFieldCount = this.addFieldCount - 1;
    }
  }
  dateChange(event: any) {
    const dateValue = event.target.value;
  }
  captureOTP() {
    const otp1 = this.otp1Input.nativeElement.value;
    const otp2 = this.otp2Input.nativeElement.value;
    const otp3 = this.otp3Input.nativeElement.value;
    const otp4 = this.otp4Input.nativeElement.value;
    const otp5 = this.otp5Input.nativeElement.value;
    const otp6 = this.otp6Input.nativeElement.value;

    this.otpValue = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
  }
  move(e: any, p: any, c: any, n: any) {
    var length = c.value.length;
    var maxlength = c.getAttribute('maxlength');
    if (length == maxlength) {
      if (n != '') {
        n.focus();
      }
    }
    if (e.key === 'Backspace') {
      c.value = '';
      p.focus();
    }
  }
  lockLastInput(event: KeyboardEvent, c: any) {
    if (c.value.length > 1) {
      c.value = c.value.charAt(0);
    }
  }
  preventUpDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
    }
  }
  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
  // Whatsapp send OTP function
  whatsappSendOTP() {
    let payload: any = {
      OperatorId: this.profileDetails.UserId,
    };
    this.operatorapi.whatsappSendOTP(payload).then(
      (res: any) => {
        this.verifyOTP = true;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  resendOTPs() {
    this.resendOTP = true;
  }
  // Whatsapp send OTP function
  whatsappVerifyOTP() {
    this.whatsappLoader = true;
    this.captureOTP();
    let payload: any = {
      OperatorId: this.profileDetails.UserId,
      WhatsappOTP: Number(this.otpValue),
    };
    this.operatorapi.whatsappOTPVerify(payload).then(
      (res: any) => {
        let payloads = {
          UserId: this.profileDetails.EmailId,
        };
        this.operatorapi.getProfileDetails(payloads).then((res: any) => {
          let userData = res.data.MainData;
        });
        this.whatsappLoader = false;
        this.verifyOTP = false;
        this.resendOTP = false;
        this.sendOTP = true;
        this.resendOTP = false;
      },
      (err: any) => {
        this.whatsappLoader = false;
        if (err.error.error.message) {
          this.invalidOTP = true;
        }
      }
    );
  }
  whatsappVerification() {
    if (this.profileDetails.WhatsappVerification) {
      this.sendOTP = true;
    } else {
      this.sendOTP = false;
    }
  }
  onPhoneNumberChange() {
    this.sendOTP = false;
    this.verifiyAfterSubmit = true;
  }
  //on click of Submit button
  fieldSubmit() {
    this.modalRef.hide();
    this.documentOneName = this.basicDetails.value.documentName1;
    this.documentTwoName = this.basicDetails.value.documentName2;
    this.documentThreeName = this.basicDetails.value.documentName3;
  }
  //To get the first character of the letter
  getCharacter() {
    this.firstLetter = '';
    this.secondLetter = '';
    let char = this.profileDetails.FirstName;
    let nameParts = '';
    nameParts = char.split(' ');
    this.firstLetter = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
      this.secondLetter = nameParts[nameParts.length - 1]
        .charAt(0)
        .toUpperCase();
    }
    if (this.secondLetter.length == 0) {
      this.secondLetter = this.firstLetter;
    }
  }
  onLogout() {
    this.webSocketService.closeConnection();
    this.router.navigateByUrl('operator/operator-login');
    this.sureExit = false;
  }
  onExit() {
    this.sureExit = true;
  }
  onStay() {
    this.sureExit = false;
  }
  getFilled() {
    this.fillArea = 1;
  }
  getConicGradient(): string {
    let progressValue = 0;
    if (this.basicDetails.value.fullName != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.emailID != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.phoneNumber != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.dateOfBirth != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.country != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.countryCode != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile1 != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile2 != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile3 != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile4 != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.kmlFile5 != '') {
      progressValue = progressValue + 10;
    }
    return `conic-gradient(
      from 180deg,
      #ffffff ${progressValue * 3.0}deg,
      #4b5563 ${progressValue * 3.0}deg
    )`;
  }
}
export function ageCalculator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    var today = new Date();
    var birthDate = new Date(value);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18 ? { age: true } : null;
  };
}
