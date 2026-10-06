import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthLevelGuard  {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let decrypt = CryptoJS.AES.decrypt(localStorage.getItem('AdminDetails').toString(), environment.authorityKey);
      let profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      let levels = route.data.authorityLevels
      let authorizePayment = levels.includes(profileDetails.Level)
      if (authorizePayment) {
        return true;
      } else {
        return false;
      }
  }

}
