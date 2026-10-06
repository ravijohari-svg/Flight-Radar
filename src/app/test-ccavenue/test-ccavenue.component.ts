import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test-ccavenue',
  templateUrl: './test-ccavenue.component.html',
  styleUrls: ['./test-ccavenue.component.scss']
})
export class TestCcavenueComponent implements OnInit {

  accessCode : any;
  url: any;
  @ViewChild('form') form : ElementRef | any;
  encRequest : any;
  environmentOperatorApi: any;


  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.accessCode = environment.ccAvenueAccessToken; 
    this.environmentOperatorApi = environment.apiOperatorUrl;
  }

  pay() {
    let payload = {
      "OperatorId": "OPRTR11",
      "FirstName": "Saradhaa",
      "SubscriptionPlan": "Basic",
      "AmountINR": 10
    }
    this.getCCAvenueEncrypt(payload)
      .then((res : any) => {
        this.encRequest = res.data.MainData;
        this.url = environment.ccAvenueURL;
        // &Merchant_Id=2156539&encRequest=${this.encRequest}`;
        setTimeout((_: any) => this.form.nativeElement.submit());
      });
  }
  getCCAvenueEncrypt(data) {
    let promise = new Promise((resolve, reject) => {
      this.http.post(`${this.environmentOperatorApi}payment-gateway/get-ccavenue-encrypt-data`, data)
        .toPromise()
        .then((res) => { 
         
          resolve(res) },
          (err) => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }

}
