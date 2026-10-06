import { Component,OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Constants } from 'src/app/constants/constants';

@Component({
  selector: 'app-operator-landing-page',
  templateUrl: './operator-landing-page.component.html',
  styleUrls: ['./operator-landing-page.component.scss'],
})
export class OperatorLandingPageComponent implements OnInit {
  createMissionForm: FormGroup;
  subsForm: FormGroup;
  submitted: boolean = false;
  decided: boolean = false;
  show:boolean = false;
  success:boolean = false;
  landingPageData = Constants.landingPageData;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private operatorApi: OperatorapisService){}

  ngOnInit(): void {
    this.createMissionForm = this.fb.group({
      YourName: [
        '',
        [
          Validators.required,
          this.alphabeticValidator,
          Validators.minLength(3),
        ],
      ],
      Mobile: [
        '',
        [
          Validators.required,
          this.numericValidator,
        ],
      ],
      Email: [
        '',
        [Validators.required, this.noWhitespaceValidator, Validators.email],
      ],
      Location: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.alphabeticValidator,
          Validators.minLength(3),
        ],
      ],
    });
    this.subsForm = this.fb.group({
      EmailId: [
        '',
        [Validators.required, this.noWhitespaceValidator, Validators.email],
      ],
    });
  }
  onLaunchUTM(){
    this.router.navigateByUrl('operator/operator-login');
  }
  get f() {
    return this.createMissionForm.controls;
  }
  get fs() {
    return this.subsForm.controls;
  }
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }
  // alphabeticValidator(control: AbstractControl): ValidationErrors | null {
  //   const alphabeticRegex = /^[a-zA-Z]+$/;
  //   const valid = alphabeticRegex.test(control.value);
  //   return valid ? { alphabetic: true } : { alphabetic: false };
  // }
  alphabeticValidator(control: AbstractControl): ValidationErrors | null {
    const alphabeticRegex = /^[a-zA-Z\s]+$/;
    const valid = alphabeticRegex.test(control.value);
    return valid ? {alphabetic: true} : { alphabetic: false };
  }


  numericValidator(control: AbstractControl): ValidationErrors | null {
    const numericRegex = /^[0-9]+$/;
    const valid = numericRegex.test(control.value);
    return valid ? { numeric: true } : { numeric: false };
  }
  sendSubsInfo(){
    this.decided = true;
    if(this.subsForm?.controls.EmailId.errors == null){
      this.decided = false;
      let payload = {
        Email : this.subsForm.value.EmailId,
        Type: "NewsLetter"
      };
      this.subsForm.reset();
      this.operatorApi.sendCustomerData(payload).then((res) =>{
        this.decided=  false;
        this.subsForm.reset();
      }).catch((err)=>{
        console.log(err);
        this.subsForm.reset();
      })
    }
  }
  nextOperation(){
   this.submitted = true;
   if((this.createMissionForm.controls.YourName.errors?.required == undefined && ((this.createMissionForm.controls?.YourName.errors?.minlength?.actualLength) ? this.createMissionForm.controls?.YourName.errors?.minlength?.actualLength > 2 : true)
    && this.createMissionForm.controls?.YourName.errors.alphabetic == true) && this.createMissionForm.controls?.Mobile.value.length === 10 && this.createMissionForm.controls?.Mobile.errors.numeric == true && this.createMissionForm?.controls.Email.errors == null &&
  (this.createMissionForm.controls.Location.errors?.required == undefined && ((this.createMissionForm.controls?.Location.errors?.minlength?.actualLength) ? this.createMissionForm.controls?.Location.errors?.minlength?.actualLength > 2 : true)
   && this.createMissionForm.controls?.Location.errors.alphabetic == true))
    {
    this.submitted = false;
    this.show = false;
    let payload ={
      FullName: this.createMissionForm.value.YourName,
      MobileNo: this.createMissionForm.value.Mobile,
      Email: this.createMissionForm.value.Email,
      Location : this.createMissionForm.value.Location,
      Type: "Compliance"
    }
    this.operatorApi.sendCustomerData(payload).then((res) =>{
      this.success = true;
      this.createMissionForm.reset();
      this.show = false;
    }).catch((err)=>{
      console.log(err);
      this.createMissionForm.reset();
      this.show = false;
    })
  }
  }
  onGeoZone(){
    this.router.navigateByUrl('operator/operator-app/dashboard');
  }
  onGeoZone1(){
    this.show = true;
  }
  closeField(){
    this.show = false;
    this.success = false;
    this.createMissionForm.reset();
    this.submitted = false;
  }
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>'],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 3
      }
    },
    nav: true
  }
}
