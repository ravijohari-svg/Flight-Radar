import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { MapLayersService } from 'src/app/custom-services/common/map-layers.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-operator-login',
  templateUrl: './operator-login.component.html',
  styleUrls: ['./operator-login.component.scss'],
})
export class OperatorLoginComponent implements OnInit, OnDestroy {
  //web-worker
  private worker: Worker;
  firstTime: boolean = false;
  encryptData;
  //Show and Hide Password
  fieldTextTypePass;
  //loader
  loader;
  // login loading
  loading;
  profileDetails;
  //Forms
  loginForm: FormGroup;
  submitted;
  //Error Messages
  loginFail = '';
  urlType;
  mapId;
  routeParamsSubscription: any;
  redirectToCreateMission;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private operatorapi: OperatorapisService,
    private operatorService: OperatorService,
    private maplayerService: MapLayersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initialFunction();
  }
  initialFunction() {
    this.routeParamsSubscription = this.route.params.subscribe((param) => {
      this.redirectToCreateMission = param['create-mission'];
    });

    localStorage.clear();
    this.loginForm = this.fb.group({
      EmailID: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loginForm.valueChanges.subscribe(() => {
      this.loginFail = '';
    });

    if (localStorage.getItem('FirstTimeVisit')) {
      this.firstTime = true;
    } else {
      this.firstTime = false;
    }
  }
  // Focus on input email when page load
  @ViewChild('opEmail') opEmail: ElementRef;
  ngAfterViewInit() {
    this.opEmail.nativeElement.focus();
  }

  //alternative to this.operatorService.getProfileDetails(); for loader purposes
  // getProfileDetails() {
  //   let payload = {
  //     UserId: this.loginForm.value.EmailID.toLowerCase(),
  //   };
  //   this.operatorapi.getProfileDetails(payload).then((res: any) => {
  //     this.profileDetails = res.data.MainData;
  //     let encryData = CryptoJS.AES.encrypt(
  //       JSON.stringify(this.profileDetails),
  //       environment.operatorKey
  //     );
  //     localStorage.setItem('UserDetails', encryData);
  //     this.router.navigateByUrl('operator/operator-app');
  //     this.loader = false;
  // }
  getProfileDetails(payloads) {
    return this.operatorapi.getProfileDetails(payloads).then((res: any) => {
      this.worker = new Worker(
        new URL('./operator-login.worker', import.meta.url),
        { type: 'module', name: 'worker-three' }
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
  getUrls() {
    this.operatorapi.getStadiaMapURl().then((res: any) => {
      let url = res.data.MainData.MapAPIUrl;
      this.urlType = res.data.MainData.MapAPIType;
      this.mapId = res.data.MainData.MapAPIId;
      this.maplayerService.getMapId(this.mapId);
      // this.maplayerService.getUrl(url);
      this.maplayerService.getUrlType(this.urlType);
    });
  }
  getProfile() {
    let payloads = {
      UserId: this.loginForm.value.EmailID.toLowerCase(),
    };
    this.getProfileDetails(payloads).then((data: any) => {
      this.encryptData = data;
      localStorage.setItem('UserDetails', this.encryptData);
      //if user clicked on create-mission button while not logged in
      this.redirectToCreateMission == 'create-mission'
        ? this.router.navigateByUrl(
            'operator/operator-app/mission/create-mission'
          )
        : this.router.navigateByUrl('operator/operator-app');
      this.loader = false;
      this.worker.terminate();
      let urlData = {
        urlType: this.urlType,
        mapId: this.mapId,
      };
      let encryUrl = CryptoJS.AES.encrypt(
        JSON.stringify(urlData),
        environment.operatorKey
      );
      localStorage.setItem('UrlData', encryUrl);
    });
  }

  //Login Form Submit
  onLoginFormSubmit() {
    this.submitted = true;
    this.loader = true;
    if (this.loginForm.valid) {
      this.operatorapi
        .signIn(
          this.loginForm.value.EmailID.toLowerCase(),
          this.loginForm.value.Password
        )
        .then(
          (data) => {
            localStorage.setItem('userIDToken', data['idToken']['jwtToken']);
            localStorage.setItem(
              'userAccessToken',
              data['accessToken']['jwtToken']
            );
            localStorage.setItem(
              'userRefreshToken',
              data['refreshToken']['token']
            );
            this.getUrls();
            this.getProfile();
            // call by service
            // this.operatorService.EmailId(this.loginForm.value.EmailID.toLowerCase());
            // this.operatorService.getProfileDetails();

            //alternative to 'call by service'

            // this.getProfileDetails();

            // this.router.navigateByUrl('operator/operator-app');
            // window.alert('Login successful');
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

  toforgotPassword() {
    this.router.navigate(['common/operator/forgot-password']);
  }
  //Show and Hide Password
  toggleFieldTextTypePass() {
    this.fieldTextTypePass = !this.fieldTextTypePass;
  }

  //FormControls
  get login() {
    return this.loginForm.controls;
  }

  ngOnDestroy(): void {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }
}
