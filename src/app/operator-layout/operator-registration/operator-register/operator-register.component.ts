import { Component,ElementRef, OnInit,ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl,ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-operator-register',
  templateUrl: './operator-register.component.html',
  styleUrls: ['./operator-register.component.scss']
})
export class OperatorRegisterComponent implements OnInit {

  signUpForm;FormGroup;
  loader:boolean= false;
  isConfirm:boolean= false;
  submitted:boolean= false;
  EmailId;
  value:any = '';
  credential:string ='';
  loaderConfirm:boolean= false;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }

  initialFunction(){
    localStorage.clear();
    this.signUpForm = this.fb.group({
      Fullname:['',[Validators.required,Validators.minLength(3),this.alphabeticalOnlyValidator()]],
      EmailID:['',[Validators.required,Validators.email]],
      WhatsAppnumber:['',[Validators.required, Validators.pattern('^[0-9]{10}$')]],
      Country: ['India',[Validators.required]],
      Checkbox: [false, [this.checkboxValidator]]
    })
  }
  // Focus on input email when page load
  @ViewChild('fullName') fullName: ElementRef;
  ngAfterViewInit() {
    this.fullName.nativeElement.focus();
  }
  operatorRegister(){
    this.submitted = true;
    if (this.signUpForm.valid && this.signUpForm.get('Checkbox').value){
      this.loader = true;
      let payload:any ={
        EmailId: this.signUpForm.value.EmailID.toLowerCase(),
        PhoneNumber: '91' + String(this.signUpForm.value.WhatsAppnumber),
      }
      this.operatorapi
      .whatsAppAndEmailCheck(payload)
      .then(
      (res:any) => {
        this.loader = false;
        this.isConfirm = true;
      },
      (err:any) => {
        this.loader = false;
        this.credentialStatus(err.error.error.type,err.error.error.message);
      }
    );

    }
  }
  alphabeticalOnlyValidator(): ValidatorFn {
    return (control) => {
      const value = control.value;
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        return { alphabeticalOnly: true };
      }
      return null;
    };
  }
  credentialStatus(val,message){
    this.value = val;
    if(this.value == 'Mobile'){
     this.credential = message;
    }
    else if(this.value == 'Email'){
      this.credential = message;
    }
    else if(this.value == 'EmailMobile'){
      this.credential = message;
    }
  }
  operatorRegistration(){
    this.loaderConfirm = true;
    let payload:any ={
      FirstName: this.signUpForm.value.Fullname,
      LastName: this.signUpForm.value.Fullname,
      EmailId: this.signUpForm.value.EmailID.toLowerCase(),
      PhoneNumber: '91' + String(this.signUpForm.value.WhatsAppnumber),
      Country:this.signUpForm.value.Country,
      CountryCode: "IN"
    }
    this.operatorapi
    .newOperatorRegisteration(payload)
    .then((res:any)=>
        {
        this.EmailId = res.data.MainData.EmailId;
        this.isConfirm = false;
        let encrydata =  CryptoJS.AES.encrypt(JSON.stringify(this.EmailId), environment.operatorKey);
        localStorage.setItem('OperatorDetail',encrydata);
        this.loaderConfirm = false;
        this.router.navigateByUrl('operator-registration/email-verification');
      },
      (err:any) => {
        console.log(err);
      }
    );
  }
  checkboxValidator(control: AbstractControl) {
    if (!control.value) {
      return { required: true };
    }
    return null;
  }
  isCancel(){
    this.isConfirm = false;
  }
  get signUp(){
    return this.signUpForm.controls;
  }

}
