import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkPreLoadOperatorService {

  constructor(private router: Router) { }
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return this.hasGoodConnection() ? load() : EMPTY;
  }

  hasGoodConnection(): boolean {
    const conn = navigator['connection'];
    if (conn) {
      if (conn.saveData) {
        return false; // save data mode is enabled, so dont preload
      }
      const avoidTheseConnections = ['slow-2g', '2g' /* , '3g', '4g' */];
      const effectiveType = conn.effectiveType || '';
      if (avoidTheseConnections.includes(effectiveType)) {
        return false;
      }
    }
    if(!this.router.url.includes('/operator/operator-app'))
      return false;
    return true;
  }
}
