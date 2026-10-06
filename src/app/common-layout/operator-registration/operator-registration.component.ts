import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS, STEP_STATE } from '@angular/cdk/stepper';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { DateTimeFormatService } from 'src/app/custom-services/common/date-time-format.service';
import { Constants } from 'src/app/constants/constants';
@Component({
  selector: 'app-operator-registration',
  templateUrl: './operator-registration.component.html',
  styleUrls: ['./operator-registration.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class OperatorRegistrationComponent implements OnInit, OnDestroy {
  //Stepper
  isLinear = false;
  completed = false;
  stepperIndexValue = 0;

  //Drop Down Dummy Data
  country;
  countryList;
  CountryCode;

  // : string[] = [
  //   "Afghanistan",
  //   "Albania",
  //   "Algeria",
  //   "American Samoa",
  //   "Andorra",
  //   "Angola",
  //   "Anguilla",
  //   "Antarctica",
  //   "Antigua and Barbuda",
  //   "Argentina",
  //   "Armenia",
  //   "Aruba",
  //   "Australia",
  //   "Austria",
  //   "Azerbaijan",
  //   "Bahamas (the)",
  //   "Bahrain",
  //   "Bangladesh",
  //   "Barbados",
  //   "Belarus",
  //   "Belgium",
  //   "Belize",
  //   "Benin",
  //   "Bermuda",
  //   "Bhutan",
  //   "Bolivia (Plurinational State of)",
  //   "Bonaire, Sint Eustatius and Saba",
  //   "Bosnia and Herzegovina",
  //   "Botswana",
  //   "Bouvet Island",
  //   "Brazil",
  //   "British Indian Ocean Territory (the)",
  //   "Brunei Darussalam",
  //   "Bulgaria",
  //   "Burkina Faso",
  //   "Burundi",
  //   "Cabo Verde",
  //   "Cambodia",
  //   "Cameroon",
  //   "Canada",
  //   "Cayman Islands (the)",
  //   "Central African Republic (the)",
  //   "Chad",
  //   "Chile",
  //   "China",
  //   "Christmas Island",
  //   "Cocos (Keeling) Islands (the)",
  //   "Colombia",
  //   "Comoros (the)",
  //   "Congo (the Democratic Republic of the)",
  //   "Congo (the)",
  //   "Cook Islands (the)",
  //   "Costa Rica",
  //   "Croatia",
  //   "Cuba",
  //   "Curaçao",
  //   "Cyprus",
  //   "Czechia",
  //   "Côte d'Ivoire",
  //   "Denmark",
  //   "Djibouti",
  //   "Dominica",
  //   "Dominican Republic (the)",
  //   "Ecuador",
  //   "Egypt",
  //   "El Salvador",
  //   "Equatorial Guinea",
  //   "Eritrea",
  //   "Estonia",
  //   "Eswatini",
  //   "Ethiopia",
  //   "Falkland Islands (the) [Malvinas]",
  //   "Faroe Islands (the)",
  //   "Fiji",
  //   "Finland",
  //   "France",
  //   "French Guiana",
  //   "French Polynesia",
  //   "French Southern Territories (the)",
  //   "Gabon",
  //   "Gambia (the)",
  //   "Georgia",
  //   "Germany",
  //   "Ghana",
  //   "Gibraltar",
  //   "Greece",
  //   "Greenland",
  //   "Grenada",
  //   "Guadeloupe",
  //   "Guam",
  //   "Guatemala",
  //   "Guernsey",
  //   "Guinea",
  //   "Guinea-Bissau",
  //   "Guyana",
  //   "Haiti",
  //   "Heard Island and McDonald Islands",
  //   "Holy See (the)",
  //   "Honduras",
  //   "Hong Kong",
  //   "Hungary",
  //   "Iceland",
  //   "India",
  //   "Indonesia",
  //   "Iran (Islamic Republic of)",
  //   "Iraq",
  //   "Ireland",
  //   "Isle of Man",
  //   "Israel",
  //   "Italy",
  //   "Jamaica",
  //   "Japan",
  //   "Jersey",
  //   "Jordan",
  //   "Kazakhstan",
  //   "Kenya",
  //   "Kiribati",
  //   "Korea (the Democratic People's Republic of)",
  //   "Korea (the Republic of)",
  //   "Kuwait",
  //   "Kyrgyzstan",
  //   "Lao People's Democratic Republic (the)",
  //   "Latvia",
  //   "Lebanon",
  //   "Lesotho",
  //   "Liberia",
  //   "Libya",
  //   "Liechtenstein",
  //   "Lithuania",
  //   "Luxembourg",
  //   "Macao",
  //   "Madagascar",
  //   "Malawi",
  //   "Malaysia",
  //   "Maldives",
  //   "Mali",
  //   "Malta",
  //   "Marshall Islands (the)",
  //   "Martinique",
  //   "Mauritania",
  //   "Mauritius",
  //   "Mayotte",
  //   "Mexico",
  //   "Micronesia (Federated States of)",
  //   "Moldova (the Republic of)",
  //   "Monaco",
  //   "Mongolia",
  //   "Montenegro",
  //   "Montserrat",
  //   "Morocco",
  //   "Mozambique",
  //   "Myanmar",
  //   "Namibia",
  //   "Nauru",
  //   "Nepal",
  //   "Netherlands (the)",
  //   "New Caledonia",
  //   "New Zealand",
  //   "Nicaragua",
  //   "Niger (the)",
  //   "Nigeria",
  //   "Niue",
  //   "Norfolk Island",
  //   "Northern Mariana Islands (the)",
  //   "Norway",
  //   "Oman",
  //   "Pakistan",
  //   "Palau",
  //   "Palestine, State of",
  //   "Panama",
  //   "Papua New Guinea",
  //   "Paraguay",
  //   "Peru",
  //   "Philippines (the)",
  //   "Pitcairn",
  //   "Poland",
  //   "Portugal",
  //   "Puerto Rico",
  //   "Qatar",
  //   "Republic of North Macedonia",
  //   "Romania",
  //   "Russian Federation (the)",
  //   "Rwanda",
  //   "Réunion",
  //   "Saint Barthélemy",
  //   "Saint Helena, Ascension and Tristan da Cunha",
  //   "Saint Kitts and Nevis",
  //   "Saint Lucia",
  //   "Saint Martin (French part)",
  //   "Saint Pierre and Miquelon",
  //   "Saint Vincent and the Grenadines",
  //   "Samoa",
  //   "San Marino",
  //   "Sao Tome and Principe",
  //   "Saudi Arabia",
  //   "Senegal",
  //   "Serbia",
  //   "Seychelles",
  //   "Sierra Leone",
  //   "Singapore",
  //   "Sint Maarten (Dutch part)",
  //   "Slovakia",
  //   "Slovenia",
  //   "Solomon Islands",
  //   "Somalia",
  //   "South Africa",
  //   "South Georgia and the South Sandwich Islands",
  //   "South Sudan",
  //   "Spain",
  //   "Sri Lanka",
  //   "Sudan (the)",
  //   "Suriname",
  //   "Svalbard and Jan Mayen",
  //   "Sweden",
  //   "Switzerland",
  //   "Syrian Arab Republic",
  //   "Taiwan",
  //   "Tajikistan",
  //   "Tanzania, United Republic of",
  //   "Thailand",
  //   "Timor-Leste",
  //   "Togo",
  //   "Tokelau",
  //   "Tonga",
  //   "Trinidad and Tobago",
  //   "Tunisia",
  //   "Turkey",
  //   "Turkmenistan",
  //   "Turks and Caicos Islands (the)",
  //   "Tuvalu",
  //   "Uganda",
  //   "Ukraine",
  //   "United Arab Emirates (the)",
  //   "United Kingdom of Great Britain and Northern Ireland (the)",
  //   "United States Minor Outlying Islands (the)",
  //   "United States of America (the)",
  //   "Uruguay",
  //   "Uzbekistan",
  //   "Vanuatu",
  //   "Venezuela (Bolivarian Republic of)",
  //   "Viet Nam",
  //   "Virgin Islands (British)",
  //   "Virgin Islands (U.S.)",
  //   "Wallis and Futuna",
  //   "Western Sahara",
  //   "Yemen",
  //   "Zambia",
  //   "Zimbabwe",
  //   "Åland Islands"
  // ];

  //Verification Code UI Configuration
  config = Constants.verfictaionCodeUIConfig;

  //Stepper
  @ViewChild('stepper') stepper: MatStepper;

  @ViewChild('regFullName') regFullName: ElementRef;
  ngAfterViewInit() {
    this.regFullName.nativeElement.focus();
    this.stepper._getIndicatorType = () => STEP_STATE.NUMBER;
  }

  //Forms
  registrationForm: FormGroup;
  basicDetails: FormGroup;
  verification: FormGroup;
  whatsappOTPForm: FormControl;
  // Documents
  profilePic = '';
  passportProof = '';
  addressProof = '';
  // Validation Flag
  submitted;
  // Show and Hide Summary
  fieldTextTypeConfirmPass;
  fieldTextTypePass;
  //Error Messages
  regErrMessage;
  fileSizeError;

  //Unsubscribing Observables
  private unSubscribe = new Subject();

  //Loader
  loader;
  disabled;

  //Form Submit err messages
  formSubmitErr;
  whatsappOtpErrmsg;
  OperatorId;

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

  showSwal(type, option1?, option2?) {
    if (type == 'registration-success') {
      this.swalWithBootstrapButtons
        .fire({
          background: Constants.swal_bg_color,
          text: 'Registration completed successfully',
          icon: 'success',
          focusConfirm: false,
          showCancelButton: false,
          showConfirmButton: true,
          allowOutsideClick: false,
          // timer: 1000,
          confirmButtonText: 'Login',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('operator/operator-login');
          }
        });
    }
  }

  constructor(
    private fb: FormBuilder,
    private dateAndTimeFormat: DateTimeFormatService,
    private operatorapi: OperatorapisService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  //Initial Function
  initialFunction() {
    this.operatorapi.getCountryList().then((res: any) => {
      this.countryList = res.data.MainData;
      this.country = this.countryList.map((val) => (val = val.name));
    });

    this.registrationForm = this.fb.group({
      basicDetails: this.fb.group({
        Name: ['', Validators.required],
        EmailId: ['', [Validators.required, Validators.email]],
        PhoneNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        DOB: ['', [Validators.required, ageCalculator()]],
        // Location : ['', Validators.required],
        Country: ['', Validators.required],
        Certification: ['', Validators.required],
        Picture: [''],
        PictureType: [''],
        PassportCopy: [''],
        PassportFileType: [''],
        AddressProof: [''],
        AddressFileType: [''],
        AadharNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(14),
            Validators.maxLength(14),
            Validators.pattern('^[0-9]{4}-[0-9]{4}-[0-9]{4}$'),
          ],
        ],
      }),
      verification: this.fb.group(
        {
          Password: ['', [Validators.required, Validators.minLength(8)]],
          ConfirmPassword: ['', [Validators.required, Validators.minLength(8)]],
          VerificationCode: [
            '',
            [
              Validators.required,
              Validators.minLength(6),
              Validators.maxLength(6),
            ],
          ],
        },
        {
          validators: this.password.bind(this),
        }
      ),
    });
    (this.whatsappOTPForm = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ])),
      (this.basicDetails = this.registrationForm.get(
        'basicDetails'
      ) as FormGroup);
    this.verification = this.registrationForm.get('verification') as FormGroup;
    this.registrationForm.valueChanges
      .pipe(takeUntil(this.unSubscribe))
      .subscribe(() => {
        this.regErrMessage = '';
        this.formSubmitErr = '';
      });
  }
  // Validate Country
  onCountrySelect(event: any) {
    this.CountryCode = this.countryList.find(
      (val: { name: string }) => val.name === event.item
    )?.code;
    this.basicDetails.get('Country').updateValueAndValidity();
  }
  // Mask aadhar card
  applyAadharNumberMask(event: any) {
    const value = event.target.value;

    if (isNaN(value)) {
      this.basicDetails.get('AadharNumber').setValue('');
    }

    const aadharNumber = value.replace(/\D/g, '');

    if (aadharNumber.length > 0) {
      const maskedAadharNumber = aadharNumber.replace(
        /^(\d{4})(\d{0,4})?(\d{0,4})?(\d{0,4})?/,
        (match, p1, p2, p3, p4) =>
          [p1, p2 && '-' + p2, p3 && '-' + p3, p4 && '-' + p4].join('')
      ); // Apply the mask

      this.basicDetails.get('AadharNumber').setValue(maskedAadharNumber);
    }
  }

  //Stepper
  onNextStepper(stepper: MatStepper) {
    this.submitted = true;
    // Added for testing purpose
    // this.stepper.selected.completed = true;
    // this.stepperIndexValue = stepper.selectedIndex + 1;
    // this.stepper.next();
    // this.submitted = false;
    this.CountryCode = this.countryList.find(
      (val) => this.basicDetails.value.Country == val.name
    )?.code;

    if (this.basicDetails.valid && this.CountryCode) {
      this.loader = true;
      this.disabled = true;
      // Call Registration API
      let payload: any = {
        FirstName: this.basicDetails.value.Name,
        LastName: this.basicDetails.value.Name,
        EmailId: this.basicDetails.value.EmailId.toLowerCase(),
        PhoneNumber: '91' + String(this.basicDetails.value.PhoneNumber),
        DOB: this.dateAndTimeFormat.dateAndTimeFormatting(
          new Date(this.basicDetails.value.DOB),
          'date'
        ),
        // Location: this.basicDetails.value.Location,
        Country: this.basicDetails.value.Country,
        CountryCode: this.CountryCode,
        Certification: this.basicDetails.value.Certification,
        AadharNumber: this.basicDetails.value.AadharNumber.replace(/-/g, ''),
      };

      if (this.basicDetails.value.PassportCopy !== '') {
        payload.PassportCopy = this.basicDetails.value.PassportCopy; // base 64 file
        payload.PassportFileType = this.basicDetails.value.PassportFileType;
      }
      if (this.basicDetails.value.AddressProof !== '') {
        payload.AddressProof = this.basicDetails.value.AddressProof; // base 64 file
        payload.AddressFileType = this.basicDetails.value.AddressFileType;
      }
      if (this.basicDetails.value.Picture !== '') {
        payload.Picture = this.basicDetails.value.Picture; // base 64 file,
        payload.PictureType = this.basicDetails.value.PictureType;
      }
      this.operatorapi
        .newOperatorRegister(payload)
        .pipe(takeUntil(this.unSubscribe))
        .subscribe(
          (res) => {
            this.OperatorId = res.data.MainData.OperatorId;
            this.stepper.selected.completed = true;
            this.stepperIndexValue = stepper.selectedIndex + 1;
            this.stepper.next();
            this.submitted = false;
            this.loader = false;
            this.disabled = false;
          },
          (err) => {
            this.loader = false;
            this.disabled = false;
            this.regErrMessage = err.error.error.message;
          }
        );
    } else {
      this.stepper.selected.completed = false;
    }
  }
  onWhatsappVerification(stepper: MatStepper) {
    this.disabled = false;
    this.submitted = true;
    if (this.whatsappOTPForm.valid) {
      let payload: any = {
        WhatsappOTP: Number(this.whatsappOTPForm.value),
        OperatorId: this.OperatorId,
      };
      this.operatorapi
        .whatsappOTPVerify(payload)
        .then((res) => {
          this.stepper.selected.completed = true;
          this.stepperIndexValue = stepper.selectedIndex + 1;
          this.stepper.next();
          this.submitted = false;
          this.loader = false;
          this.disabled = false;
        })
        .catch((err) => {
          this.disabled = false;
          this.loader = false;
          this.whatsappOtpErrmsg = err.error.error.message;
        });
    }
  }
  onFormSubmit(stepper: MatStepper) {
    this.submitted = true;
    if (this.registrationForm.valid) {
      this.disabled = true;
      this.loader = true;
      // Call Reset password API
      let payload = {
        UserName: this.basicDetails.value.EmailId.toLowerCase(),
        VerificationCode: this.verification.value.VerificationCode,
        Password: this.verification.value.Password,
      };
      this.operatorapi
        .resetPassword(payload)
        .pipe(takeUntil(this.unSubscribe))
        .subscribe(
          (res) => {
            this.loader = false;
            this.disabled = false;
            this.showSwal('registration-success');
            // this.router.navigateByUrl('operator/operator-login');
          },
          (err) => {
            this.formSubmitErr = err?.error?.error?.message;
            this.disabled = false;
            this.loader = false;
          }
        );
    } else {
    }
  }
  selectionChange(event) {
    this.stepperIndexValue = event.selectedIndex;
  }
  //Forms
  //Documents
  uploadProfilePicture(evt) {
    const files: File = evt.target.files; // FileList object
    const file = files[0];

    if (
      (file.name.endsWith('.jpeg') ||
        file.name.endsWith('.jpg') ||
        file.name.endsWith('.png')) &&
      file.size <= 500000
    ) {
      this.profilePic = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          Picture: splitArr[1],
          PictureType: file.name.endsWith('.jpeg')
            ? 'jpeg'
            : file.name.endsWith('.jpg')
            ? 'jpg'
            : 'png',
        });
      });
    } else {
      this.fileSizeError = true;
    }
  }
  uploadPassportProof(evt) {
    this.fileSizeError = false
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.name.endsWith('.pdf') && file.size <= 500000) {
      this.passportProof = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          PassportCopy: splitArr[1],
          PassportFileType: 'pdf',
        });
      });
    } else {
      this.fileSizeError = true;
    }
  }
  uploadAddressProof(evt) {
    this.fileSizeError = false
    const files: File = evt.target.files; // FileList object
    const file = files[0];
    if (file.name.endsWith('.pdf') && file.size <= 500000) {
      this.addressProof = file.name;
      this.getBase64(file).then((data: any) => {
        var splitArr = data.split('base64,');
        this.basicDetails.patchValue({
          AddressProof: splitArr[1],
          AddressFileType: 'pdf',
        });
      });
    } else {
      this.fileSizeError = true;
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
  //Verification Code
  onOtpChange(val) {
    this.verification.patchValue({ VerificationCode: val });
  }
  onWhatsappOtpChange(val) {
    this.whatsappOTPForm.patchValue(val);
  }
  // Custom Validation for Password
  password(formGroup: FormGroup) {
    const { value: password } = formGroup.get('Password');
    const { value: confirmPassword } = formGroup.get('ConfirmPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }
  //Show and Hide Password
  toggleFieldTextTypeConfirmPass() {
    this.fieldTextTypeConfirmPass = !this.fieldTextTypeConfirmPass;
  }
  toggleFieldTextTypePass() {
    this.fieldTextTypePass = !this.fieldTextTypePass;
  }

  // Form Custom Validations

  // Min 18 years
  getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  //Form Controls
  get basic() {
    return this.basicDetails.controls;
  }
  get verify() {
    return this.verification.controls;
  }
  get mismatch() {
    return this.verification.errors;
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
