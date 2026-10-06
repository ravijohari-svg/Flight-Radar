import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';

@Component({
  selector: 'app-operator-verification',
  templateUrl: './operator-verification.component.html',
  styleUrls: ['./operator-verification.component.scss']
})
export class OperatorVerificationComponent implements OnInit {
  resendMail:boolean= false;
  emailId:string = '';

  constructor(private operatorapi: OperatorapisService) { }

  ngOnInit(): void {
    let decrypt = CryptoJS.AES.decrypt(
      localStorage.getItem('OperatorDetail').toString(),
      environment.operatorKey
    );
    this.emailId = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
  }

  resendEmail(){
    let payload:any={
      UserId:this.emailId
    }
    this.operatorapi.emailVerificationAgain(payload).then( (res:any)=>{
      this.resendMail = true;
    },
    (err:any) => {
      console.log(err.message);
    }
    )
  }
  close(){
    this.resendMail = false;
  }
}
