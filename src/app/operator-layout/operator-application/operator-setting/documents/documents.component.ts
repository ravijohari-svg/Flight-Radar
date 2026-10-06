import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import Swal from 'sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  //Modal
  modalRef: BsModalRef;
  modalRef2: BsModalRef;

  //Profile Details
  profileDetails;
  profile;

  //Loader
  loader;

  //api response
  response;
  firstLetter: String = '';
  secondLetter: String = '';

  //submitted
  submitted = false;

  //Drop Down Dummy Data
  countryArr;
  countryList;
  CountryCode;
  sureExit: boolean = false;

  //Form Fields
  pilotProfileForm: FormGroup;
  basicDetails: FormGroup;

  // Documents
  profilePic = '';
  passportProof = '';
  addressProofFlag = '';
  panFlag = '';
  operationsPlanFileName = '';
  uinOfDronesFileName = '';
  dgcaCertificateFileName = '';
  insuranceFileName = '';
  incorporationFileName = '';
  companyProfileFileName = '';
  documentsArr = [];
  addressUpload: boolean = false;
  profilePicUpload: boolean = false;
  passportUpload: boolean = false;
  panUpload: boolean = false;
  operationsPlanUpload: boolean = false;
  uinOfDronesUpload: boolean = false;
  dgcaCertificateFileUpload: boolean = false;
  insuranceUpload: boolean = false;
  incorporationUpload: boolean = false;
  companyProfileUpload: boolean = false;

  //Error Messages
  regErrMessage;
  fileSizeError;
  pictureSizeError = false;
  passportSizeError = false;
  addressSizeError = false;
  panSizeError: boolean = false;
  kmlFileSizeError = false;
  operationsPlanFileSizeError = false;
  uinOfDronesFileSizeError = false;
  dgcaCertificateFileSizeError = false;
  insuranceFileSizeError = false;
  incorporationFileSizeError = false;
  companyProfileFileSizeError = false;
  editable = false;
  deletedDocumentType = '';

  // upcoming documents
  pictureUrl = '';
  passportUrl = '';
  addressProofUrl = '';
  panUrl = '';
  operationsPlanUrl = '';
  uinOfDronesUrl = '';
  dgcaCertificateUrl = '';
  insuranceUrl = '';
  incorporationUrl = '';
  companyProfileUrl = '';
  pictureUrlFlag: boolean = false;
  passportUrlFlag: boolean = false;
  addressProofUrlFlag: boolean = false;
  panUrlFlag: boolean = false;
  operationsPlanUrlFlag: boolean = false;
  uinOfDronesUrlFlag: boolean = false;
  dgcaCertificateUrlFlag: boolean = false;
  insuranceUrlFlag: boolean = false;
  incorporationUrlFlag: boolean = false;
  companyProfileUrlFlag: boolean = false;
  //name of document
  myForm: FormGroup;

  //swal
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
  showConfirmSwal(data?) {
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
          this.deleteUploadedDocuments(data);
        }
      });
  }
  constructor(
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private operatorService: OperatorService,
    private router: Router
  ) {
    // new logic
    // this.myForm = this.fb.group({
    //   inputs: this.fb.array([])
    // });
  }
  ngOnInit(): void {
    this.initialFunction();
  }
  //Contain those functionality needed at first run of this component
  initialFunction() {
    this.loader = true;
    //API to get countries
    this.operatorapi.getCountryList().then((res: any) => {
      this.countryList = res.data.MainData;
      this.countryArr = this.countryList.map((val) => (val = val.name));
    });
    //Building Form
    this.basicDetails = this.fb.group({
      picture: new FormControl('', Validators.required),
      //  picture: new FormControl(''),
      pictureType: new FormControl(''),
      // passportCopy:new FormControl( '', Validators.required),
      passportCopy: new FormControl(''),
      passportFileType: new FormControl(''),
      addressProof: new FormControl('', Validators.required),
      //  addressProof: new FormControl(''),
      addressFileType: new FormControl(''),
      //  pan: new FormControl(''),
      pan: new FormControl('', Validators.required),
      panFileType: new FormControl(''),
      //Operations Plan
      operationsPlan: new FormControl(''),
      operationsPlanType: new FormControl(''),
      //UIN Of Drones
      uinOfDrones: new FormControl(''),
      uinOfDronesType: new FormControl(''),
      // DGCA certificate of Pilot
      dgcaCertificate: new FormControl(''),
      dgcaCertificateType: new FormControl(''),
      //Insurance
      insurance: new FormControl(''),
      insuranceType: new FormControl(''),
      //Incorporation certificate
      incorporation: new FormControl(''),
      incorporationType: new FormControl(''),
      //Company profile
      companyProfile: new FormControl(''),
      companyProfileType: new FormControl(''),
    });

    //Getting profile information
    this.profileDetails = this.operatorService.returnProfileDetails();
    let payload = {
      UserId: this.profileDetails.UserId,
    };
    this.operatorapi.retrieveDocuments(payload).then((res: any) => {
      this.profileDetails = [];
      this.profileDetails = res.data;
      this.documentsExistChecker(this.profileDetails);
    });

    this.getCharacter();
    this.getConicGradient();
  }
  //Form Controls
  get pictureType() {
    return this.basicDetails.get('pictureType');
  }
  get picture() {
    return this.basicDetails.get('picture');
  }
  get passportCopy() {
    return this.basicDetails.get('passportCopy');
  }
  get passportFileType() {
    return this.basicDetails.get('passportFileType');
  }
  get addressProof() {
    return this.basicDetails.get('addressProof');
  }
  get addressFileType() {
    return this.basicDetails.get('addressFileType');
  }
  get pan() {
    return this.basicDetails.get('pan');
  }
  get panFileType() {
    return this.basicDetails.get('panFileType');
  }
  get operationsPlan() {
    return this.basicDetails.get('operationsPlan');
  }
  get operationsPlanType() {
    return this.basicDetails.get('operationsPlanType');
  }
  get uinOfDrones() {
    return this.basicDetails.get('uinOfDrones');
  }
  get uinOfDronesType() {
    return this.basicDetails.get('uinOfDronesType');
  }
  get dgcaCertificate() {
    return this.basicDetails.get('dgcaCertificate');
  }
  get dgcaCertificateType() {
    return this.basicDetails.get('dgcaCertificateType');
  }
  get insurance() {
    return this.basicDetails.get('insurance');
  }
  get insuranceType() {
    return this.basicDetails.get('insuranceType');
  }
  get incorporation() {
    return this.basicDetails.get('incorporation');
  }
  get incorporationType() {
    return this.basicDetails.get('incorporationType');
  }
  get companyProfile() {
    return this.basicDetails.get('companyProfile');
  }
  get companyProfileType() {
    return this.basicDetails.get('companyProfileType');
  }

  get basic() {
    return this.basicDetails.controls;
  }

  //On click of cancel button
  formCancel() {
    this.editable = !this.editable;
  }
  //documents already exists or not available
  documentsExistChecker(profileDetails) {
    this.profileDetails = profileDetails;
    this.companyProfileFileName = '';
    this.panFlag = '';
    this.passportProof = '';
    this.operationsPlanFileName = '';
    this.uinOfDronesFileName = '';
    this.dgcaCertificateFileName = '';
    this.insuranceFileName = '';
    this.incorporationFileName = '';
    this.addressProofFlag = '';
    this.profilePic = '';
    if (this.profileDetails) {
      if (this.profileDetails?.ComponyProfileUrl) {
        this.companyProfileFileName =
          this.profileDetails?.ComponyProfileUrl_Name;
        this.companyProfileUrl = this.profileDetails?.ComponyProfileUrl;
        this.basicDetails.patchValue({
          companyProfile: 'Already',
          companyProfileType: 'Already',
        });
        this.companyProfileUrlFlag = true;
      } else {
        this.companyProfileUrlFlag = false;
      }
      if (this.profileDetails?.PassportCopyUrl) {
        this.passportProof = this.profileDetails?.PassportCopyUrl_Name;
        this.passportUrl = this.profileDetails?.PassportCopyUrl;
        this.basicDetails.patchValue({
          passportCopy: 'Already',
          passportFileType: 'Already',
        });
        this.passportUrlFlag = true;
      } else {
        this.passportUrlFlag = false;
      }
      if (this.profileDetails?.PanCardUrl) {
        this.panFlag = this.profileDetails?.PanCardUrl_Name;
        this.panUrl = this.profileDetails?.PanCardUrl;
        this.basicDetails.patchValue({
          pan: 'Already',
          panFileType: 'Already',
        });
        this.panUrlFlag = true;
      } else {
        this.panUrlFlag = false;
      }
      if (this.profileDetails?.OperationPlanUrl) {
        this.operationsPlanFileName =
          this.profileDetails?.OperationPlanUrl_Name;
        this.operationsPlanUrl = this.profileDetails?.OperationPlanUrl;
        this.basicDetails.patchValue({
          operationsPlan: 'Already',
          operationsPlanType: 'Already',
        });
        this.operationsPlanUrlFlag = true;
      } else {
        this.operationsPlanUrlFlag = false;
      }
      if (this.profileDetails?.UinCertificateUrl) {
        this.uinOfDronesFileName = this.profileDetails?.UinCertificateUrl_Name;
        this.uinOfDronesUrl = this.profileDetails?.UinCertificateUrl;
        this.basicDetails.patchValue({
          uinOfDrones: 'Already',
          uinOfDronesType: 'Already',
        });
        this.uinOfDronesUrlFlag = true;
      } else {
        this.uinOfDronesUrlFlag = false;
      }
      if (this.profileDetails?.PilotCertificateUrl) {
        this.dgcaCertificateFileName =
          this.profileDetails?.PilotCertificateUrl_Name;
        this.dgcaCertificateUrl = this.profileDetails?.PilotCertificateUrl;
        this.basicDetails.patchValue({
          dgcaCertificate: 'Already',
          dgcaCertificateType: 'Already',
        });
        this.dgcaCertificateUrlFlag = true;
      } else {
        this.dgcaCertificateUrlFlag = false;
      }
      if (this.profileDetails?.InsuranceUrl) {
        this.insuranceFileName = this.profileDetails?.InsuranceUrl_Name;
        this.insuranceUrl = this.profileDetails?.InsuranceUrl;
        this.basicDetails.patchValue({
          insurance: 'Already',
          insuranceType: 'Already',
        });
        this.insuranceUrlFlag = true;
      } else {
        this.insuranceUrlFlag = false;
      }
      if (this.profileDetails?.IncorporationUrl) {
        this.incorporationFileName = this.profileDetails?.IncorporationUrl_Name;
        this.incorporationUrl = this.profileDetails?.IncorporationUrl;
        this.basicDetails.patchValue({
          incorporation: 'Already',
          incorporationType: 'Already',
        });
        this.incorporationUrlFlag = true;
      } else {
        this.incorporationUrlFlag = false;
      }
      if (this.profileDetails?.AddressProofUrl) {
        this.addressProofFlag = this.profileDetails?.AddressProofUrl_Name;
        this.addressProofUrl = this.profileDetails?.AddressProofUrl;
        this.basicDetails.patchValue({
          addressProof: 'Already',
          addressFileType: 'Already',
        });
        this.addressProofUrlFlag = true;
      } else {
        this.addressProofUrlFlag = false;
      }
      if (this.profileDetails?.PictureUrl) {
        this.profilePic = this.profileDetails?.PictureUrl_Name;
        this.pictureUrl = this.profileDetails?.PictureUrl;
        this.basicDetails.patchValue({
          picture: 'Already',
          pictureType: 'Already',
        });
        this.pictureUrlFlag = true;
      } else {
        this.pictureUrlFlag = false;
      }
    }
    this.loader = false;
  }

  documentsPayloadFormer() {
    let payloadObject: any = {};

    if (this.basicDetails.value.operationsPlan !== '') {
      payloadObject.OperationPlan = {
        FileType: this.basicDetails.value.operationsPlanType,
        Name: this.operationsPlanFileName,
        Document: this.basicDetails.value.operationsPlan,
      };
    } else {
      payloadObject.OperationPlan = null;
    }

    if (this.basicDetails.value.picture !== '') {
      payloadObject.Picture = {
        FileType: this.basicDetails.value.pictureType,
        Name: this.profilePic,
        Document: this.basicDetails.value.picture,
      };
    } else {
      payloadObject.Picture = null;
    }

    if (this.basicDetails.value.addressProof !== '') {
      payloadObject.AddressProof = {
        FileType: this.basicDetails.value.addressFileType,
        Name: this.addressProofFlag,
        Document: this.basicDetails.value.addressProof,
      };
    } else {
      payloadObject.AddressProof = null;
    }

    if (this.basicDetails.value.passportCopy !== '') {
      payloadObject.PassportCopy = {
        FileType: this.basicDetails.value.passportFileType,
        Name: this.passportProof,
        Document: this.basicDetails.value.passportCopy,
      };
    } else {
      payloadObject.PassportCopy = null;
    }

    if (this.basicDetails.value.panFlag !== '') {
      payloadObject.PanCard = {
        FileType: this.basicDetails.value.panFileType,
        Name: this.panFlag,
        Document: this.basicDetails.value.pan,
      };
    } else {
      payloadObject.PanCard = null;
    }

    if (this.basicDetails.value.dgcaCertificate !== '') {
      payloadObject.PilotCertificate = {
        FileType: this.basicDetails.value.dgcaCertificateType,
        Name: this.dgcaCertificateFileName,
        Document: this.basicDetails.value.dgcaCertificate,
      };
    } else {
      payloadObject.PilotCertificate = null;
    }

    if (this.basicDetails.value.uinOfDrones !== '') {
      payloadObject.UINCertificate = {
        FileType: this.basicDetails.value.uinOfDronesType,
        Name: this.uinOfDronesFileName,
        Document: this.basicDetails.value.uinOfDrones,
      };
    } else {
      payloadObject.UINCertificate = null;
    }
    if (this.basicDetails.value.insurance != '') {
      payloadObject.Insurance = {
        FileType: this.basicDetails.value.insuranceType,
        Name: this.insuranceFileName,
        Document: this.basicDetails.value.insurance,
      };
    } else {
      payloadObject.Insurance = null;
    }

    if (this.basicDetails.value.incorporation !== '') {
      payloadObject.Incorporation = {
        FileType: this.basicDetails.value.incorporationType,
        Name: this.incorporationFileName,
        Document: this.basicDetails.value.incorporation,
      };
    } else {
      payloadObject.Incorporation = null;
    }

    if (this.basicDetails.value.companyProfile !== '') {
      payloadObject.CompanyProfile = {
        FileType: this.basicDetails.value.companyProfileType,
        Name: this.companyProfileFileName,
        Document: this.basicDetails.value.companyProfile,
      };
    } else {
      payloadObject.CompanyProfile = null;
    }

    return payloadObject;
  }

  //On click of confirm details button
  formSumbit() {
    this.submitted = true;
    if (this.basicDetails.valid) {
      this.addressUpload = false;
      this.profilePicUpload = false;
      this.passportUpload = false;
      this.panUpload = false;
      this.operationsPlanUpload = false;
      this.uinOfDronesUpload = false;
      this.dgcaCertificateFileUpload = false;
      this.insuranceUpload = false;
      this.incorporationUpload = false;
      this.companyProfileUpload = false;
      this.loader = true;
      //required to enable field
      this.editableForm();
      //disabled filed doesn't show in the form
      let payload: any = {
        OperatorId: this.profileDetails.UserId,
      };
      const documentsPayload = this.documentsPayloadFormer();
      if (Object.keys(documentsPayload).length > 0) {
        payload.Documents = documentsPayload;
      }
      //New promise API
      this.operatorapi.updateDocuments(payload).then(
        (res) => {
          let payloads = {
            UserId: this.profileDetails.UserId,
          };
          this.submitted = false;
          this.loader = false;
          this.getConicGradient();
          this.showSwal('updated-successfully');
          this.documentsArr = [];
        },
        (err) => {
          this.documentsArr = [];
          this.loader = false;
          this.regErrMessage = err.error.error.message;
        }
      );
    }
  }

  //delete API call
  deleteUploadedDocuments(data) {
    this.loader = true;
    let payload = {
      UserId: this.profileDetails.UserId,
      documentUrl: data,
    };
    this.operatorapi.deleteDocuments(payload).then(
      (res: any) => {
        let payloads = {
          UserId: this.profileDetails.UserId,
        };
        if (res) {
          this.operatorapi.retrieveDocuments(payloads).then((res: any) => {
            if (res) {
              this.profileDetails = [];
              this.profileDetails = res.data;
              this.documentsExistChecker(this.profileDetails);
            }
          });
        }
      },
      (err: any) => {
        console.log(err);
        this.loader = false;
      }
    );

    switch (data) {
      case this.pictureUrl:
      case this.picture:
        this.pictureUrlFlag = false;
        break;

      case this.addressProofUrl:
      case this.addressProof:
        this.addressProofUrlFlag = false;
        break;

      case this.panUrl:
      case this.pan:
        this.panUrlFlag = false;
        break;

      case this.passportUrl:
      case this.passportCopy:
        this.passportUrlFlag = false;
        break;

      case this.operationsPlanUrl:
      case this.operationsPlan:
        this.operationsPlanUrlFlag = false;
        break;

      case this.uinOfDronesUrl:
      case this.uinOfDrones:
        this.uinOfDronesUrlFlag = false;
        break;

      case this.dgcaCertificateUrl:
      case this.dgcaCertificate:
        this.dgcaCertificateUrlFlag = false;
        break;

      case this.insuranceUrl:
      case this.insurance:
        this.insuranceUrlFlag = false;
        break;

      case this.incorporationUrl:
      case this.incorporation:
        this.incorporationUrlFlag = false;
        break;

      case this.companyProfileUrl:
      case this.companyProfile:
        this.companyProfileUrlFlag = false;
        break;

      default:
        break;
    }
  }
  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  //On click of profile photo field button
  uploadProfilePicture(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.pictureSizeError = false;
      this.pictureUrlFlag = true;
      this.profilePic = file.name;
      this.pictureUrl = '';
      this.profilePicUpload = true;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          picture: splitArr[1],
          pictureType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.pictureSizeError = true;
    }
  }
  //On click of passport field
  uploadPassportProof(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.passportSizeError = false;
      this.passportUrlFlag = true;
      this.passportUrl = '';
      this.passportProof = file.name;
      this.passportUpload = true;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          passportCopy: splitArr[1],
          passportFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.passportSizeError = true;
    }
  }
  //On click of address field
  uploadAddressProof(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.addressUpload = true;
      this.addressProofUrlFlag = true;
      this.addressSizeError = false;
      this.addressUpload = true;
      this.addressProofUrl = '';
      this.addressProofFlag = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          addressProof: splitArr[1],
          addressFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.addressSizeError = true;
    }
  }
  //On click of address field
  uploadPan(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.panUrlFlag = true;
      this.panSizeError = false;
      this.panFlag = file.name;
      this.panUrl = '';
      this.panUpload = true;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          pan: splitArr[1],
          panFileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.panSizeError = true;
    }
  }

  //On click ofoperation field
  operationsPlanUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.operationsPlanFileSizeError = false;
      this.operationsPlanUrlFlag = true;
      this.operationsPlanUpload = true;
      this.operationsPlanUrl = '';
      this.operationsPlanFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          operationsPlan: splitArr[1],
          operationsPlanType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.operationsPlanFileSizeError = true;
    }
  }
  //On click of uin field
  uinOfDronesUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.uinOfDronesFileSizeError = false;
      this.uinOfDronesUrlFlag = true;
      this.uinOfDronesUpload = true;
      this.uinOfDronesUrl = '';
      this.uinOfDronesFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          uinOfDrones: splitArr[1],
          uinOfDronesType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.uinOfDronesFileSizeError = true;
    }
  }
  //On click of DGCA field
  dgcaCertificateUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.dgcaCertificateFileSizeError = false;
      this.dgcaCertificateUrlFlag = true;
      this.dgcaCertificateUrl = '';
      this.dgcaCertificateFileUpload = true;
      this.dgcaCertificateFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          dgcaCertificate: splitArr[1],
          dgcaCertificateType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.dgcaCertificateFileSizeError = true;
    }
  }
  //On click of insurance field
  insuranceUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.insuranceFileSizeError = false;
      this.insuranceUrlFlag = true;
      this.insuranceUpload = true;
      this.insuranceUrl = '';
      this.insuranceFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          insurance: splitArr[1],
          insuranceType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.insuranceFileSizeError = true;
    }
  }
  //On click of incorporation field
  incorporationUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.incorporationFileSizeError = false;
      this.incorporationUrlFlag = true;
      this.incorporationUpload = true;
      this.incorporationUrl = '';
      this.incorporationFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          incorporation: splitArr[1],
          incorporationType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.incorporationFileSizeError = true;
    }
  }
  //On click ofCompany profile field
  companyProfileUploads(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (
      (file.name.endsWith('.pdf') ||
        file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.companyProfileFileSizeError = false;
      this.companyProfileUrlFlag = true;
      this.companyProfileUpload = true;
      this.companyProfileFileName = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          companyProfile: splitArr[1],
          companyProfileType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
      this.companyProfileFileSizeError = true;
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

  resetProfilePicture() {
    if (this.pictureUrlFlag) {
      // this.pictureUrlFlag = false;
      this.basicDetails.patchValue({
        picture: '',
        pictureType: '',
      });
      this.pictureSizeError = false;
      if (this.pictureUrl != '') {
        this.showConfirmSwal(this.pictureUrl);
      } else if (this.profilePicUpload && this.pictureUrl == '') {
        this.pictureUrlFlag = false;
      }
    } else {
      this.pictureUrlFlag = false;
      this.basicDetails.patchValue({
        picture: '',
        pictureType: '',
      });
      this.pictureSizeError = false;
    }
  }
  resetAddressProof() {
    if (this.addressProofUrlFlag) {
      this.basicDetails.patchValue({
        addressProof: '',
        addressFileType: '',
      });
      this.addressSizeError = false;
      if (this.addressUpload && this.addressProofUrl == '') {
        this.addressProofUrlFlag = false;
      } else if (this.addressProofUrl != '') {
        this.showConfirmSwal(this.addressProofUrl);
      }
    } else {
      this.addressProofUrlFlag = false;
      this.basicDetails.patchValue({
        addressProof: '',
        addressFileType: '',
      });
      this.addressSizeError = false;
    }
  }
  resetPan() {
    if (this.panUrlFlag) {
      this.basicDetails.patchValue({
        pan: '',
        panFileType: '',
      });
      this.panSizeError = false;
      if (this.panUrl != '') {
        this.showConfirmSwal(this.panUrl);
      } else if (this.panUpload && this.panUrl == '') {
        this.panUrlFlag = false;
      }
    } else {
      this.panUrlFlag = false;
      this.basicDetails.patchValue({
        pan: '',
        panFileType: '',
      });
      this.panSizeError = false;
    }
  }

  resetPassportProof() {
    if (this.passportUrlFlag) {
      this.basicDetails.patchValue({
        passportCopy: '',
        passportFileType: '',
      });
      this.passportSizeError = false;
      if (this.passportUrl != '') {
        this.showConfirmSwal(this.passportUrl);
      } else if (this.passportUpload && this.passportUrl == '') {
        this.passportUrlFlag = false;
      }
    } else {
      this.passportUrlFlag = false;
      this.basicDetails.patchValue({
        passportCopy: '',
        passportFileType: '',
      });
      this.passportSizeError = false;
    }
  }
  resetOperationsPlan() {
    if (this.operationsPlanUrlFlag) {
      this.basicDetails.patchValue({
        operationsPlan: '',
        operationsPlanType: '',
      });
      this.operationsPlanFileSizeError = false;
      if (this.operationsPlanUrl != '') {
        this.showConfirmSwal(this.operationsPlanUrl);
      } else if (this.operationsPlanUpload && this.operationsPlanUrl == '') {
        this.operationsPlanUrlFlag = false;
      }
    } else {
      this.operationsPlanUrlFlag = false;
      this.basicDetails.patchValue({
        operationsPlan: '',
        operationsPlanType: '',
      });
      this.operationsPlanFileSizeError = false;
    }
  }
  resetUinOfDrones() {
    if (this.uinOfDronesUrlFlag) {
      this.basicDetails.patchValue({
        uinOfDrones: '',
        uinOfDronesType: '',
      });
      if (this.uinOfDronesUrl != '') {
        this.showConfirmSwal(this.uinOfDronesUrl);
      } else if (this.uinOfDronesUpload && this.uinOfDronesUrl == '') {
        this.uinOfDronesUrlFlag = false;
      }
    } else {
      this.uinOfDronesUrlFlag = false;
      this.basicDetails.patchValue({
        uinOfDrones: '',
        uinOfDronesType: '',
      });
      this.uinOfDronesFileSizeError = false;
    }
  }
  resetDgcaCertificate() {
    if (this.dgcaCertificateUrlFlag) {
      this.basicDetails.patchValue({
        dgcaCertificate: '',
        dgcaCertificateType: '',
      });
      this.dgcaCertificateFileSizeError = false;
      if (this.dgcaCertificateUrl != '') {
        this.showConfirmSwal(this.dgcaCertificateUrl);
      } else if (
        this.dgcaCertificateFileUpload &&
        this.dgcaCertificateUrl == ''
      ) {
        this.dgcaCertificateUrlFlag = false;
      }
    } else {
      this.dgcaCertificateUrlFlag = false;
      this.basicDetails.patchValue({
        dgcaCertificate: '',
        dgcaCertificateType: '',
      });
      this.dgcaCertificateFileSizeError = false;
    }
  }
  resetInsurance() {
    if (this.insuranceUrlFlag) {
      this.basicDetails.patchValue({
        insurance: '',
        insuranceType: '',
      });
      this.insuranceFileSizeError = false;
      if (this.insuranceUrl != '') {
        this.showConfirmSwal(this.insuranceUrl);
      } else if (this.insuranceUpload && this.insuranceUrl == '') {
        this.insuranceUrlFlag = false;
      }
    } else {
      this.insuranceUrlFlag = false;
      this.basicDetails.patchValue({
        insurance: '',
        insuranceType: '',
      });
      this.insuranceFileSizeError = false;
    }
  }
  resetIncorporation() {
    if (this.incorporationUrlFlag) {
      this.basicDetails.patchValue({
        incorporation: '',
        incorporationType: '',
      });
      this.incorporationFileSizeError = false;
      if (this.incorporationUrl != '') {
        this.showConfirmSwal(this.incorporationUrl);
      } else if (this.incorporationUpload && this.incorporationUrl != '') {
        this.incorporationUrlFlag = false;
      }
    } else {
      this.incorporationUrlFlag = false;
      this.basicDetails.patchValue({
        incorporation: '',
        incorporationType: '',
      });
      this.incorporationFileSizeError = false;
    }
  }
  resetCompanyProfile() {
    if (this.companyProfileUrlFlag) {
      this.basicDetails.patchValue({
        companyProfile: '',
        companyProfileType: '',
      });
      this.companyProfileFileSizeError = false;

      if (this.companyProfileUrl) {
        this.showConfirmSwal(this.companyProfileUrl);
      } else if (this.companyProfileUpload && this.companyProfileUrl != '') {
        this.companyProfileUrlFlag = false;
      }
    } else {
      this.companyProfileUrlFlag = false;
      this.basicDetails.patchValue({
        companyProfile: '',
        companyProfileType: '',
      });
      this.companyProfileFileSizeError = false;
    }
  }
  //On click of editable btn
  editableForm() {
    this.editable = !this.editable;
  }
  //on click of Submit button
  fieldSubmit() {
    this.modalRef.hide();
  }
  onLogout() {
    this.router.navigateByUrl('operator/operator-login');
    this.sureExit = false;
  }
  onExit() {
    this.sureExit = true;
  }
  onStay() {
    this.sureExit = false;
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
  getConicGradient(): string {
    let progressValue = 0;
    if (this.basicDetails.value.picture != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.passportCopy != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.addressProof != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.pan != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.operationsPlan != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.uinOfDrones != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.dgcaCertificate != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.insurance != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.incorporation != '') {
      progressValue = progressValue + 10;
    }
    if (this.basicDetails.value.companyProfile != '') {
      progressValue = progressValue + 10;
    }

    return `conic-gradient(
    from 180deg,
    #ffffff ${progressValue * 3.6}deg,
    #4b5563 ${progressValue * 3.6}deg
  )`;
    this.loader = false;
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
