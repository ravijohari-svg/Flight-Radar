import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';
import { environment } from 'src/environments/environment';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';

import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-authority-login',
  templateUrl: './authority-login.component.html',
  styleUrls: ['./authority-login.component.scss'],
})
export class AuthorityLoginComponent implements OnInit {
  //Worker
  private worker: Worker;
  encryptData;
  //Show and Hide Password
  fieldTextTypePass;

  //Forms
  loginForm: FormGroup;
  submitted;
  urlType;
  mapId;
  //Error Messages
  loginFail = '';

  //loader
  loader;

  //Profile Details
  profileDetails;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private authorityApi: AuthorityapisService,
    private maplayerService: MapLayersService
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }
  initialFunction() {
    localStorage.clear();
    this.loginForm = this.fb.group({
      EmailID: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loginForm.valueChanges.subscribe(() => {
      this.loginFail = '';
    });
  }
  // Focus on input email when page load
  @ViewChild('authEmail') authEmail: ElementRef;
  ngAfterViewInit() {
    this.authEmail.nativeElement.focus();
  }
  getProfileDetails(payloads) {
    return this.authorityApi
      .getProfileDetails(payloads)
      .toPromise()
      .then((res: any) => {
        this.worker = new Worker(
          new URL('./authority-login.worker', import.meta.url),
          { type: 'module', name: 'worker-four' }
        );
        return new Promise((resolve, reject) => {
          let data = res.data.MainData;
          let payload = {
            data,
          };
          this.worker.postMessage({ payload });
          this.worker.onmessage = ({ data }) => {
            resolve(data);
          };
        });
      });
  }
  getProfile() {
    let payloads = {
      EmailId: this.loginForm.value.EmailID.toLowerCase(),
    };
    this.getProfileDetails(payloads).then((data: any) => {
      this.encryptData = data;
      localStorage.setItem('AdminDetails', this.encryptData);
      this.router.navigateByUrl('authority/authority-app/dashboard');
      this.loader = false;
      this.worker.terminate();
      let urlData = {
        urlType: this.urlType,
        mapId: this.mapId,
      };
      let encryUrl = CryptoJS.AES.encrypt(
        JSON.stringify(urlData),
        environment.authorityKey
      );
      localStorage.setItem('UrlsData', encryUrl);
    });
  }
  getUrls() {
    this.authorityApi.getStadiaMapURl().then((res: any) => {
      let url = res.data.MainData.MapAPIUrl;
      this.urlType = res.data.MainData.MapAPIType;
      this.mapId = res.data.MainData.MapAPIId;
      this.maplayerService.getMapId(this.mapId);
      // this.maplayerService.getUrl(url);
      this.maplayerService.getUrlType(this.urlType);
    });
  }
  //Login Form Submit
  onLoginFormSubmit() {
    this.submitted = true;
    this.loader = true;
    if (this.loginForm.valid) {
      this.authorityApi
        .signIn(
          this.loginForm.value.EmailID.toLowerCase(),
          this.loginForm.value.Password
        )
        .then(
          (data) => {
            localStorage.setItem('adminIDToken', data['idToken']['jwtToken']);
            localStorage.setItem(
              'adminAccessToken',
              data['accessToken']['jwtToken']
            );
            localStorage.setItem(
              'adminRefreshToken',
              data['refreshToken']['token']
            );
            this.getUrls();
            this.getProfile();
            // saroj - 2023-06-30 - removed encription for sending payload for getting profile details
            // let payload = {
            //   EmailId: this.loginForm.value.EmailID.toLowerCase(),
            // };
            // this.authorityApi
            //   .getProfileDetails(payload)
            //   .subscribe((res: any) => {
            //     this.profileDetails = res.data.MainData;
            //     // this.profileDetails.Level = 'L3';
            //     // this.authorityApi.getCountryCode()
            //     //   .then((res: any) => {

            //     // let country = res.find((val) => val.name == this.profileDetails.Country);
            //     // this.profileDetails.CountryCode = country.code;
            //     let encryData = CryptoJS.AES.encrypt(
            //       JSON.stringify(this.profileDetails),
            //       environment.authorityKey
            //     );

            //     localStorage.setItem('AdminDetails', encryData);
            //     // localStorage.setItem('AdminDetails', JSON.stringify(this.profileDetails));
            //     this.router.navigateByUrl('authority/authority-app');
            //     // });
            //     this.loader = false;
            // });
          },
          (err) => {
            this.loader = false;
            this.loginFail = err.message;
          }
        );
    } else {
      this.loader = false;
    }
  }
  //Show and Hide Password
  toggleFieldTextTypePass() {
    this.fieldTextTypePass = !this.fieldTextTypePass;
  }
  //FormControls
  get login() {
    return this.loginForm.controls;
  }

  toforgotPassword() {
    this.router.navigate(['common/authority/forgot-password']);
  }
}

// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker('./authority-login.worker', { type: 'module' });
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }
