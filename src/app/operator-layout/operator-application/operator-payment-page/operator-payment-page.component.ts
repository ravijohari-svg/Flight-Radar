import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OperatorService } from 'src/app/custom-services/operator/operator.service';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PaymentModalService } from 'src/app/custom-services/operator/payment-modal.service';

// import {} from '../../../../../assets/common-layout/'

// Payment
declare var Razorpay: any;
@Component({
  selector: 'app-operator-payment-page',
  templateUrl: './operator-payment-page.component.html',
  styleUrls: ['./operator-payment-page.component.scss'],
})
export class OperatorPaymentPageComponent implements OnInit, AfterViewInit {
  profileDetails;

  razorPayKeyId = environment.razorPayKeyID;

  pricingPlans = [];

  orderDetails;
  modalRef: BsModalRef;

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

  accessCode: any;
  url: any;
  @ViewChild('form') form: ElementRef | any;
  encRequest: any;


  @ViewChild('payment', { static: false }) payment: ElementRef;

  constructor(
    private operatorService: OperatorService,
    private operatorapi: OperatorapisService,
    private modalService: BsModalService,
    private paymentModalService: PaymentModalService,
  ) { }

  activePlanStatus = 0;


  ngOnInit(): void {
    this.accessCode = environment.ccAvenueAccessToken;
    this.initialFunction();
  }
  ngAfterViewInit() {
    this.paymentModal(this.payment);

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
  paymentModal(test) {
    this.modalRef = this.modalService.show(test, {
      class: 'modal-dialog-centered gray payment-modal',
      backdrop: 'static',
      keyboard: false
    });
    // this.test = true;
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
          amount: this.orderDetails.amount, //Converting to paisa
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
          // "retry" : true,
          prefill: {
            email: this.profileDetails.EmailId,
            contact: this.profileDetails.PhoneNumber,
          },
          handler: (response) => {
            this.updatePaymentSuccess(plan.Module, response);
            this.showSwal('payment-success');
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
  updatePaymentSuccess(plan, successResponse?) {
    successResponse = {
      "razorpay_payment_id": "pay_LDRt9zwEJrvYP6",
      "razorpay_order_id": "order_LDRt2fcuLvKOUF",
      "razorpay_signature": "01bb9a6b73c9dc25185eb01d59c650d3f3526e476930d6a390db078af52a119e"
    }
    let payload = {
      OperatorId: this.profileDetails.UserId,
      SubscriptionPlan: plan.Module,
      AmountINR: Number(plan.Price) * 100,
      ...successResponse,
    };
    this.operatorapi
      .updatePaymentSucess(payload)
      .then((res: any) => {
        let profileDetail = res.data.MainData;
        this.profileDetails = {

          ...this.profileDetails,
          ...profileDetail,
        };
        let encryData = CryptoJS.AES.encrypt(JSON.stringify(this.profileDetails), environment.operatorKey);
        localStorage.setItem('UserDetails', encryData);
        this.showSwal('payment-success');

      })
    // .catch((err) => console.log(err));
  }
  //Cancel
  onModalClose() {
    this.modalRef?.hide();
    this.paymentModalService.setPaymentModal(false);
  }

  //CC Avenue
  ccAvenuePay(plan) {
    let payload = {
      OperatorId: this.profileDetails.UserId,
      FirstName: this.profileDetails.FirstName,
      SubscriptionPlan: plan.Module,
      AmountINR: plan.Price,
    }
    this.operatorapi.getCCAvenueEncrypt(payload)
      .then((res: any) => {
        this.encRequest = res.data.MainData;
        this.url = environment.ccAvenueURL;
        // &Merchant_Id=2156539&encRequest=${this.encRequest}`;
        setTimeout((_: any) => this.form.nativeElement.submit());
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
