import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl, ValidatorFn } from '@angular/forms';
import { Router,ActivatedRoute} from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-operator-password',
  templateUrl: './operator-password.component.html',
  styleUrls: ['./operator-password.component.scss']
})
export class OperatorPasswordComponent implements OnInit {
  passwordForm;FormGroup;
  loader:boolean = false;
  fieldTextTypePass:boolean = false;
  fieldTextTypePassed:boolean=false;
  submitted:boolean = false;
  isShow:boolean = false;
  passDiff: boolean = false;
  confirmationCode: string='';
  userName: string='';
  isExpire:boolean = false;
  private queryParamsSubscription: Subscription;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private operatorService: OperatorService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.initialFunction();
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.confirmationCode = params['confirmation_code'];
      this.userName = params['user_name'];
    });
  }
  // Focus on input email when page load
  @ViewChild('Password') Password: ElementRef;
  ngAfterViewInit() {
    this.Password.nativeElement.focus();
  }
  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
  initialFunction(){
    this.passwordForm = this.fb.group({
      Password:['',[Validators.required,Validators.minLength(8),this.containsCapitalLetter(),
        this.containsLowerCaseLetter(),
        this.containsNumber(),
        this.containsSpecialCharacter()]],
      ConfirmPassword: ['',[Validators.required,Validators.minLength(8)]],
    })
  }
  validatePassword(control) {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;
    return pattern.test(control.value) ? null : { invalidPassword: true };
  }
  get passForm(){
    return this.passwordForm.controls;
  }
   //Show and Hide Password
   toggleFieldTextTypePass() {
    this.fieldTextTypePass = !this.fieldTextTypePass;
  }
  toggleFieldTextTypePassed() {
    this.fieldTextTypePassed = !this.fieldTextTypePassed;
  }
  setPassword(){
    this.submitted = true;
    if(this.passwordForm.value.Password == this.passwordForm.value.ConfirmPassword && this.passwordForm.valid){
      this.loader = true;
      this.passDiff = false;
      let payload :any = {
        UserName: this.userName,
        VerificationCode: this.confirmationCode,
        Password:this.passwordForm.value.Password
      }
      this.operatorapi.setPassOperator(payload).then((res:any)=>{
        this.isShow = true;
        this.loader = false;
        let encryData = CryptoJS.AES.encrypt(
          JSON.stringify(res),
          environment.operatorKey
        );
        localStorage.setItem('FirstTimeVisit', encryData);
        this.router.navigateByUrl('operator-login');
      },
      (err:any)=>{
        this.loader = false;
        if(err.error.error.message){
         this.isExpire = true;
        }
       console.log(err);
      }
     )
    }
    else{
      this.passDiff = true;
    }

  }
  containsCapitalLetter(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value as string;
      if (!/[A-Z]/.test(value)) {
        return { containsCapitalLetter: true };
      }
      return null;
    };
  }
  containsLowerCaseLetter(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value as string;
      if (!/[a-z]/.test(value)) {
        return { containsLowerCaseLetter: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }
  containsNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value as string;
      if (!/\d/.test(value)) {
        return { containsNumber: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }
  containsSpecialCharacter(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value as string;
      if (!/[!@#$$%^&*]/.test(value)) {
        return { containsSpecialCharacter: true }; // Validation failed
      }
      return null; // Validation passed
    };
  }
}
