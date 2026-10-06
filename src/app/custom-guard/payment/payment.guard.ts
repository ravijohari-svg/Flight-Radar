import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { environment } from '../../../../src/environments/environment';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class PaymentGuard  {
  constructor(private operatorApi: OperatorapisService, private router: Router) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let decrypt = CryptoJS.AES.decrypt(localStorage.getItem('UserDetails').toString(), environment.operatorKey);
    let profileDetails = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    let expectedPaymentMode = route.data.paymentMode
    let authorizePayment = expectedPaymentMode.includes(profileDetails.SubscriptionPlan)
    if (authorizePayment) {
      return true;
    } else {
      return this.router.navigateByUrl('operator-app/dashboard');
    }
  }


}
