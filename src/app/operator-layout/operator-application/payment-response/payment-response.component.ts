import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { environment } from 'src/environments/environment';

//Crypto
import * as crypto from 'crypto';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';

@Component({
  selector: 'app-payment-response',
  templateUrl: './payment-response.component.html',
  styleUrls: ['./payment-response.component.scss'],
})
export class PaymentResponseComponent implements OnInit {
  response;
  profileDetails;
  loader;
  //webworker
  private worker: Worker;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private operatorApi: OperatorapisService,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.loader = true;
    if (localStorage.getItem('UserDetails') != null) {
      this.profileDetails = this.operatorService.returnProfileDetails();
    }
    try {
      let encryptResponse = this.route.snapshot.paramMap.get('response');
      this.response = this.decryption(encryptResponse);
      if (this.response.OrderId && this.response.order_status) {
        if (this.response.order_status === 'Success') {
          this.updateProfileDetails();
        } else {
          this.loader = false;
        }
      } else {
        throw Error('invalid response');
      }
    } catch {
      this.loader = false;
      this.router.navigateByUrl('operator/operator-app');
    }
  }
  //To update payment plan and other details
  updateProfileDetails() {
    let payload = {
      EmailId: this.profileDetails.EmailId,
      UserId: this.profileDetails.EmailId,
    };
    this.operatorApi.getProfileDetails(payload).then(
      (res: any) => {
        this.profileDetails = res.data.MainData;
        this.getEncry(this.profileDetails).then((res: any) => {
          let encryData = res;
          localStorage.setItem('UserDetails', encryData);
        });
        this.profileDetails = this.operatorService.returnProfileDetails();
        this.worker.terminate();
        this.loader = false;
      },
      (err) => {
        this.loader = false;
      }
    );
  }
  getEncry(data) {
    return new Promise((resolve, reject) => {
      let payload = {
        data,
      };
      this.worker = new Worker(new URL('./payment-response.worker', import.meta.url), {
        type: 'module',
        name: 'worker-six',
      });
      this.worker.postMessage({ payload });
      this.worker.onmessage = ({ data }) => {
        resolve(data);
      };
    });
  }

  //Convert base64 encrypt into object
  decryption(jsonResp) {
    let encryptionStr = window.atob(jsonResp);

    const privatekey = environment.privatekey;

    let decryptedString = '';

    const encryptedData = Buffer.from(encryptionStr, 'base64');
    const decryptedData = crypto.privateDecrypt(
      {
        key: privatekey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      encryptedData
    );

    let decoder = new TextDecoder();
    decryptedString = decryptedString + decoder.decode(decryptedData);

    jsonResp = this.testJSON(decryptedString)
      ? JSON.parse(decryptedString)
      : decryptedString;

    return jsonResp;
  }
  testJSON(text) {
    if (typeof text !== 'string') {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }
  redirectDashboard() {
    this.router.navigateByUrl('operator/operator-app');
  }
}

// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker('./payment-response.worker', { type: 'module' });
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }
