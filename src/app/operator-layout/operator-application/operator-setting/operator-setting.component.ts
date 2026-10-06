import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-operator-setting',
  templateUrl: './operator-setting.component.html',
  styleUrls: ['./operator-setting.component.scss'],
})
export class OperatorSettingComponent implements OnInit {
  profileDetails: any;

  constructor() {}

  ngOnInit(): void {
    let decrypt;
    if (localStorage.getItem('UserDetails')) {
      decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('UserDetails').toString(),
        environment.operatorKey
      );

      this.profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    }
  }
}
