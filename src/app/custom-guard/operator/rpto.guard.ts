import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RptoGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let decrypt;
    let profileDetails;
    if (localStorage.getItem('UserDetails')) {
      decrypt = CryptoJS.AES.decrypt(
        localStorage.getItem('UserDetails').toString(),
        environment.operatorKey
      );
      profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));    
    }
    if (profileDetails.RPTO) {
      return true;
    } else {
      return this.router.navigateByUrl(
        'operator/operator-app/operators-setting/pilots-profile'
      );
    }
  }
}
