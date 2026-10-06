import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
@Injectable({
  providedIn: 'root'
})
export class OperatorRoutesGuard  {

  constructor(private operatorApi : OperatorapisService, private router : Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let decrypt;
      let profileDetails;
      if(localStorage.getItem('UserDetails')) {
        decrypt = CryptoJS.AES.decrypt(localStorage.getItem('UserDetails').toString(), environment.operatorKey);
        profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      }
    let userAuthenticated = this.operatorApi.getAuthenticatedUser();
    if(userAuthenticated == null || profileDetails == null || profileDetails == undefined || profileDetails == '') {
      return this.router.navigateByUrl('operator/operator-login');
    } else {
        return true;
    }
  }

}
