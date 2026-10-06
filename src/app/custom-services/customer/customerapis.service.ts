import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerapisService {

  environmentCustomerApi;

  public httpOptions: any;
  public httpHeaders: any;

  constructor(private http: HttpClient,) {
    this.environmentCustomerApi = environment.apiCustomerUrl;
   }
   private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
     
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(error);
  }
  headerInitializer() {
    this.httpHeaders = new HttpHeaders();
    // this.httpHeaders = this.httpHeaders.append('Access-Control-Allow-Origin','*');
    this.httpHeaders = this.httpHeaders.append('x-api-key', environment.customerAuthorization);
    
    this.httpOptions = {
      headers: this.httpHeaders
    };
    return this.httpOptions;
  }

  getOnGoingMissionList(data): Observable<any> {
    return this.http.post(this.environmentCustomerApi + 'sky-air/get-ongoing-mission-list', data, this.headerInitializer())
      .pipe(
        catchError(this.handleError)
      );
  }
  getRespectiveMissionLogs(data): Observable<any> {
    return this.http.post(this.environmentCustomerApi + 'sky-air/get-respective-mission-logs', data, this.headerInitializer())
      .pipe(
        catchError(this.handleError)
      );
  }
  getUpdatedMissionLogs(data): Observable<any> {
    return this.http.post(this.environmentCustomerApi + 'sky-air/get-respective-mission-latest-logs', data, this.headerInitializer())
      .pipe(
        catchError(this.handleError)
      );
  }
}
