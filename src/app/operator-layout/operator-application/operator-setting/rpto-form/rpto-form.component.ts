import { Component, OnInit } from '@angular/core';
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

import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/custom-services/common/websocket.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
@Component({
  selector: 'app-rpto-form',
  templateUrl: './rpto-form.component.html',
  styleUrls: ['./rpto-form.component.scss'],
})
export class RptoFormComponent implements OnInit {
  //Profile Details
  profileDetails;
  verifiyAfterSubmit: boolean = false;

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

  //Form Fields
  basicDetails: FormGroup;

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
  editable: boolean;
  pilotDetails: any;

  // Constant
  QualificationArray = ['10th', '12th', 'Graduate', 'Post Graduate'];
  IdentityArray = ['Passport', 'Voter ID', 'Ration ID', 'Driving License'];

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
            // this.initialFunction();
          }
        });
    }
    if (type == 'Document Added Successfully') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Document Added successfully',
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
            // this.formCancel();
            // this.editable = false;
            // this.initialFunction();
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
        }
      });
  }
  constructor(
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private operatorService: OperatorService,
    private router: Router,
    private webSocketService: WebSocketService
  ) {}
  ngOnInit(): void {
    this.initialFunction();
  }

  async initialFunction() {
    //Building Form
    this.basicDetails = this.fb.group({
      fullName: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        this.textOnlyValidator(),
        Validators.pattern('^(?!\\s)(?=.*\\S)[a-zA-Z\\s]+(?<!\\s)$'),
      ]),
      emailID: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.email,
      ]),
      phoneNumber: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
      ]),
      dateOfBirth: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        this.ageCalculator(),
      ]),
      maximumQualification: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      adhaarNo: new FormControl({ value: null, disabled: true }, [
        Validators.required,
        this.numberOnlyValidator(),
        this.adhaarNumberValidator(),
      ]),
      addressOnAddhaar: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        this.addressValidator(),
        Validators.max(200),
      ]),
      identityProof: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      identityNumber: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]{1,20}$'),
      ]),
      // Docs and Doc Name
      IdentityDoc: new FormControl({ value: '', disabled: true }),
      IdentityDocFileName: new FormControl(''),
      Photo: new FormControl({ value: '', disabled: true }),
      PhotoFileName: new FormControl(''),
      TenthCertificate: new FormControl({ value: '', disabled: true }),
      TenthCertificateFileName: new FormControl(''),
      GraduationCertificate: new FormControl({ value: '', disabled: true }),
      GraduationCertificateFileName: new FormControl(''),
      Resume: new FormControl({ value: '', disabled: true }),
      ResumeFileName: new FormControl(''),
      MedicalFitnessCertificate: new FormControl({ value: '', disabled: true }),
      MedicalFitnessCertificateFileName: new FormControl(''),
      Signature: new FormControl({ value: '', disabled: true }),
      SignatureFileName: new FormControl(''),
    });

    this.profileDetails = this.operatorService.returnProfileDetails();
    this.getConicGradient();
    this.getCharacter();
    this.getFilled();

    const payload = {
      OperatorId: this?.profileDetails?.UserId,
    };

    const data: any = await this.operatorapi.getRptoFormData(payload);
    this.pilotDetails = data.body;

    if (this.pilotDetails) {
      this.patchValue();
    }
  }
  ageCalculator(): ValidatorFn {
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
      return age < 15 ? { age: true } : null;
    };
  }
  addressValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value.trim()) {
        return { pattern: true }; // Validation failed if value contains only spaces
      }
    };
  }

  patchValue() {
    this.basicDetails.patchValue({
      fullName: this.pilotDetails?.FullName || '',
      emailID: this.pilotDetails?.Email || '',
      phoneNumber: this.pilotDetails?.WhatsappNum || '',
      dateOfBirth: this.pilotDetails?.DOB
        ? new Date(this.pilotDetails?.DOB)
        : '',
      maximumQualification: this.pilotDetails?.MaxQualification || '',
      adhaarNo: this.pilotDetails?.AdharNum || '',
      addressOnAddhaar: this.pilotDetails?.Address || '',
      identityProof: this.pilotDetails?.Identity || '',
      identityNumber: this.pilotDetails?.IdentityNum || '',

      // docs
      IdentityDoc: this.pilotDetails?.IdentityDoc?.DocumentUrl || '',
      Photo: this.pilotDetails?.Photo?.DocumentUrl || '',
      TenthCertificate: this.pilotDetails?.TenthCertificate?.DocumentUrl || '',
      GraduationCertificate:
        this.pilotDetails?.GraduationCertificate?.DocumentUrl || '',
      Resume: this.pilotDetails?.Resume?.DocumentUrl || '',
      MedicalFitnessCertificate:
        this.pilotDetails?.MedicalFitnessCertificate?.DocumentUrl || '',
      Signature: this.pilotDetails?.Signature?.DocumentUrl || '',
      IdentityDocFileName: this.pilotDetails?.IdentityDoc?.DocumentName || '',
      PhotoFileName: this.pilotDetails?.Photo?.DocumentName || '',
      TenthCertificateFileName:
        this.pilotDetails?.TenthCertificate?.DocumentName || '',
      GraduationCertificateFileName:
        this.pilotDetails?.GraduationCertificate?.DocumentName || '',
      ResumeFileName: this.pilotDetails?.Resume?.DocumentName || '',
      MedicalFitnessCertificateFileName:
        this.pilotDetails?.MedicalFitnessCertificate?.DocumentName || '',
      SignatureFileName: this.pilotDetails?.Signature?.DocumentName || '',
    });
  }
  adhaarNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && value.length !== 12) {
        return { adhaarNumberLength: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }

  //Form Controls
  get fullName() {
    return this.basicDetails.get('fullName');
  }

  get emailID() {
    return this.basicDetails.get('emailID');
  }

  get phoneNumber() {
    return this.basicDetails.get('phoneNumber');
  }

  get dateOfBirth() {
    return this.basicDetails.get('dateOfBirth');
  }

  get maximumQualification() {
    return this.basicDetails.get('maximumQualification');
  }

  get adhaarNo() {
    return this.basicDetails.get('adhaarNo');
  }

  get addressOnAddhaar() {
    return this.basicDetails.get('addressOnAddhaar');
  }

  get identityProof() {
    return this.basicDetails.get('identityProof');
  }

  get identityNumber() {
    return this.basicDetails.get('identityNumber');
  }

  get IdentityDoc() {
    return this.basicDetails.get('IdentityDoc');
  }

  get Photo() {
    return this.basicDetails.get('Photo');
  }

  get TenthCertificate() {
    return this.basicDetails.get('TenthCertificate');
  }

  get GraduationCertificate() {
    return this.basicDetails.get('GraduationCertificate');
  }

  get Resume() {
    return this.basicDetails.get('Resume');
  }

  get MedicalFitnessCertificate() {
    return this.basicDetails.get('MedicalFitnessCertificate');
  }

  get Signature() {
    return this.basicDetails.get('Signature');
  }

  get IdentityDocFileName() {
    return this.basicDetails.get('IdentityDocFileName');
  }

  get PhotoFileName() {
    return this.basicDetails.get('PhotoFileName');
  }

  get TenthCertificateFileName() {
    return this.basicDetails.get('TenthCertificateFileName');
  }

  get GraduationCertificateFileName() {
    return this.basicDetails.get('GraduationCertificateFileName');
  }

  get ResumeFileName() {
    return this.basicDetails.get('ResumeFileName');
  }

  get MedicalFitnessCertificateFileName() {
    return this.basicDetails.get('MedicalFitnessCertificateFileName');
  }

  get SignatureFileName() {
    return this.basicDetails.get('SignatureFileName');
  }

  get basic() {
    return this.basicDetails.controls;
  }

  //On click of cancel button
  formCancel() {
    this.editable = !this.editable;
    Object.keys(this.basicDetails.controls).forEach((controlName) => {
      this.basicDetails.controls[controlName].disable();
    });
  }

  revertChanges() {
    this.formCancel();
    this.basicDetails.patchValue({
      fullName: this.pilotDetails?.FullName || '',
      emailID: this.pilotDetails?.Email || '',
      phoneNumber: this.pilotDetails?.WhatsappNum || '',
      dateOfBirth: this.pilotDetails?.DOB
        ? new Date(this.pilotDetails?.DOB)
        : '',
      maximumQualification: this.pilotDetails?.MaxQualification || '',
      adhaarNo: this.pilotDetails?.AdharNum || '',
      addressOnAddhaar: this.pilotDetails?.Address || '',
      identityProof: this.pilotDetails?.Identity || '',
      identityNumber: this.pilotDetails?.IdentityNum || '',
    });
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
  numberOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!/^\d+$/.test(value)) {
        return { numberOnly: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }

  async fileUpload(event, DocType) {
    const files: File = event.target.files; // FileList object
    const file = files[0];
    const DocControl = this.basicDetails.get(DocType);

    if (file.size >= 500000) {
      DocControl.setErrors({ sizeGreater: true });
    } else {
      const removeKey = this.basicDetails?.controls?.[DocType]?.value;
      if (removeKey) {
        await this.removeFile(DocType);
      }
      DocControl.setErrors({ loading: true });
      let data: any = await this.getBase64(file);
      let splitArr = data.split('base64,');
      const fileType: string = file.type; // File type (MIME type)
      const fileName: string = file.name; // File name

      let payload = {
        OperatorId: this.profileDetails.UserId,
        Document: {
          DocumentType: DocType,
          FileType: fileType,
          Name: fileName,
          Data: splitArr[1],
        },
      };
      try {
        await this.operatorapi.uploadRptoDocs(payload);
        this.basicDetails.patchValue({
          [DocType]: fileName,
          [DocType + 'FileName']: fileName,
        });
        DocControl.setErrors(null);
        this.showSwal('Document Added Successfully');
      } catch (e) {
        DocControl.setErrors(null);
        console.log('Issue in uploading');
      }
    }
  }

  async removeFile(DocType) {
    try {
      const payload = {
        OperatorId: this.profileDetails.UserId,
        DocumentType: DocType,
      };
      await this.operatorapi.deleteRptoDocs(payload);
    } catch (e) {
      console.log('error in deleting', e);
    } finally {
      this.basicDetails.patchValue({
        [DocType]: '',
        [DocType + 'FileName']: '',
      });
    }
  }

  //On click of confirm details button
  async formSumbit() {
    this.submitted = true;
    if (this.basicDetails.valid) {
      this.loader = true;

      let payload: any = {
        OperatorId: this.profileDetails.UserId,
        BasicDetails: {
          FullName: this.basicDetails?.controls['fullName']?.value,
          WhatsappNum: this.basicDetails?.controls['phoneNumber']?.value,
          Email: this.basicDetails?.controls['emailID']?.value,
          DOB: this.basicDetails?.controls['dateOfBirth']?.value,
          MaxQualification:
            this.basicDetails?.controls['maximumQualification']?.value,
          AdharNum: this.basicDetails?.controls['adhaarNo']?.value,
          Address: this.basicDetails?.controls['addressOnAddhaar']?.value,
          Identity: this.basicDetails?.controls['identityProof']?.value,
          IdentityNum: this.basicDetails?.controls['identityNumber']?.value,
        },
      };

      try {
        const updateResponse = await this.operatorapi.updateRptoForm(payload);

        // call api
        // this.initialFunction();

        this.submitted = false;
        this.loader = false;
        this.showSwal('updated-successfully');
        // this.getConicGradient();
      } catch (err) {
        this.loader = false;
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

  editableForm() {
    // Enable all controls in the form
    Object.keys(this.basicDetails.controls).forEach((controlName) => {
      this.basicDetails.controls[controlName].enable();
    });

    this.editable = !this.editable;

    this.basicDetails.patchValue({
      fullName: this.pilotDetails?.FullName || '',
      emailID: this.pilotDetails?.Email || '',
      phoneNumber: this.pilotDetails?.WhatsappNum || '',
      dateOfBirth: this.pilotDetails?.DOB
        ? new Date(this.pilotDetails?.DOB)
        : '',
      maximumQualification: this.pilotDetails?.MaxQualification || '',
      adhaarNo: this.pilotDetails?.AdharNum || '',
      addressOnAddhaar: this.pilotDetails?.Address || '',
      identityProof: this.pilotDetails?.Identity || '',
      identityNumber: this.pilotDetails?.IdentityNum || '',
    });
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
