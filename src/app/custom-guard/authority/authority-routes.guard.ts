import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { AuthorityapisService } from 'src/app/custom-services/authority/authorityapis.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorityRoutesGuard  {
  constructor(private authorityApi : AuthorityapisService, private router : Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let decrypt;
      let profileDetails;
      if(localStorage.getItem('AdminDetails')) {
        decrypt = CryptoJS.AES.decrypt(localStorage.getItem('AdminDetails').toString(), environment.authorityKey);
        profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      }
    let userAuthenticated = this.authorityApi.getAuthenticatedUser();
    if(userAuthenticated == null || profileDetails == null || profileDetails == undefined || profileDetails == '') {
      return this.router.navigateByUrl('authority/authority-login');
    } else {
      return true;
    }
  }

}
