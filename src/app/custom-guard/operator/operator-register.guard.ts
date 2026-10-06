import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperatorRegisterGuard  {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let operatordetail;
      if(localStorage.getItem('OperatorDetail')) {
       operatordetail = localStorage.getItem('OperatorDetail');
      }
      if(operatordetail != null || operatordetail !=undefined){
        return true;
      }
      else{
        return false;
      }
  }

}
