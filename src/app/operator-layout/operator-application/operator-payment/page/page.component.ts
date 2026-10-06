import { Component, OnInit } from '@angular/core';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

// Payment
declare var Razorpay: any;
@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  profileDetails;

  razorPayKeyId = environment.razorPayKeyID;

  pricingPlans = [];

  orderDetails;

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn primary-btn mb-3 px-4',
      cancelButton: 'btn btn-dark-border mb-3 px-4 mx-2',
      title: 'alert-title',
      // text : 'alert-text'
      // cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
  });

  constructor(
    private operatorService: OperatorService,
    private operatorapi: OperatorapisService
  ) {}

  activePlanStatus = 0;

  ngOnInit(): void {
    this.initialFunction();
  }
  initialFunction() {

    this.profileDetails = this.operatorService.returnProfileDetails();
    this.getPaymentPricingDetails();
  }

  getPaymentPricingDetails() {
    this.operatorapi
      .getPaymentPlans()
      .then((res: any) => {
        this.pricingPlans = res.data.MainData;
      })
      // .catch((err) => console.log(err));
  }
  onPay(plan) {
    let payload = {
      OperatorId: this.profileDetails.UserId,
      SubscriptionPlan: plan.Module,
      AmountINR: plan.Price,
    };
    this.operatorapi
      .createOrderId(payload)
      .then((res: any) => {
        this.orderDetails = res.data.MainData;
        let razorPayoptions = {
          key: this.razorPayKeyId,
          amount: this.orderDetails.amount * 100, //Converting to paisa
          currency: this.orderDetails.currency,
          name: 'SkyeUTM',
          description: 'Automating the skies',
          receipt: this.orderDetails.receipt,
          // image: '../../../../../assets/common-layout/SkyeUTM logoWhite.png',
          theme: {
            color: '#121212',
            backdrop_color: '#121212',
          },
          order_id: this.orderDetails.id,
          retry: {'enabled': true, 'max_count': 1},
          // "retry" : true,
          prefill: {
            email: this.profileDetails.EmailId,
            contact: this.profileDetails.PhoneNumber,
          },
          handler: async (response) => {
            await this.updatePaymentSuccess(plan.Module, response)
            .then((res) => {
              this.showSwal('payment-success');
            })
          },
          modal: {
            ondismiss: function () {
            },
          },
        };
        var rzp1 = new Razorpay(razorPayoptions);

        rzp1.on('payment.failed', (response) => {
          // this.showSwal('payment-failed');
        });
        rzp1.open();
      })
      .catch((err) => {

      });
  }
  //Update payment success
  updatePaymentSuccess(Module, successResponse) {
    let payload = {
      OperatorId: this.profileDetails.UserId,
      SubscriptionPlan: Module,
      AmountINR: this.orderDetails.amount,
      ...successResponse,
    };
    return new Promise((resolve,reject) => {
      this.operatorapi
      .updatePaymentSucess(payload)
      .then((res : any) => {
        // let payload = {
        //   EmailId: this.profileDetails.EmailId,
        //   UserId: this.profileDetails.EmailId,
        // };
        // this.operatorapi.getProfileDetails(payload).subscribe((res: any) => {
        //   this.profileDetails = res.data.MainData;
        //   let encryData = CryptoJS.AES.encrypt(JSON.stringify(this.profileDetails), environment.operatorKey);
        //   localStorage.setItem('UserDetails', encryData);
        //   resolve('resolved');
    
        // });
        resolve('dummy')
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  //Swal
  showSwal(type, option1?) {
    if (type == 'payment-success') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Payment is successfully completed!',
          icon: 'success',
          focusConfirm: false,
          // showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          // if (result.isConfirmed) {
          //   this.statusUpdateApi(this.approved, option1);
          // }
        });
    } else if (type == 'payment-failed') {
      this.swalWithBootstrapButtons
        .fire({
          background: '#1b1f27',
          text: 'Payment is failed, please try again after some time',
          icon: 'error',
          focusConfirm: false,
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: 'Okay',
          // onOpen: () => Swal.getCancelButton().focus()
        })
        .then((result) => {
          // if (result.isConfirmed) {
          //   this.statusUpdateApi(this.reject, option1);
          // }
        });
    }
  }
}
