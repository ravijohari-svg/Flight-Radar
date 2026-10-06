import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OperatorapisService } from '../../custom-services/operator/operatorapis.service';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  //Forms
  forgotPasswordForm: FormGroup;
  submitted;

  //Error Messages
  loginFail = '';

  //loader
  loader = false;

  //swal
  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
    },
    buttonsStyling: false,
  });

  moduleType: any;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private operatorApiService: OperatorapisService,
    private authorityApiService: AuthorityapisService
  ) {}

  ngOnInit(): void {
    this.moduleType = this.router.url.split('/')[2];

    this.initialFunction();
  }
  initialFunction() {
    localStorage.clear();
    this.forgotPasswordForm = this.fb.group({
      EmailID: ['', [Validators.required, Validators.email]],
    });
    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.loginFail = '';
    });
  }
  // Focus on input email when page load
  @ViewChild('authEmail') authEmail: ElementRef;
  ngAfterViewInit() {
    this.authEmail.nativeElement.focus();
  }

  // back to login
  backToLogin() {
    if (this.moduleType === 'authority') {
      this.router.navigate(['authority/authority-login']);
    } else {
      this.router.navigate(['operator/operator-login']);
    }
  }

  async onForgotPasswordFormSubmit() {
    this.submitted = true;
    this.loader = true;
    if (this.forgotPasswordForm.valid) {
      try {
        let response: any;
        if (this.moduleType === 'operator') {
          let payload = {
            UserName: this.forgotPasswordForm.value.EmailID.toLowerCase(),
          };
          response = await this.operatorApiService.forgotPassword(payload);
        } else if (this.moduleType === 'authority') {
          let payload = {
            UserName: this.forgotPasswordForm.value.EmailID.toLowerCase(),
          };
          response = await this.authorityApiService.forgotPassword(
            payload
          );
        }
        if (response) {
          this.submitted = false;
          this.loader = false;
          this.swalWithBootstrapButtons
            .fire({
              icon: 'success',
              background: '#1b1f27',
              title: `Password Reset Link Sent`,
              text: `Please check your email for password reset link.`,
              focusConfirm: false,
              showCancelButton: false,
              allowOutsideClick: false,
              confirmButtonText: 'Okay',
            })
            .then((result) => {});
        }
      } catch (error) {
        this.loader = false;
        if (error.error && error.error?.error?.message) {
          this.loginFail = error.error.error.message;
        }
      } finally {
        this.loader = false;
      }
    } else {
      this.loader = false;
    }
  }
}
