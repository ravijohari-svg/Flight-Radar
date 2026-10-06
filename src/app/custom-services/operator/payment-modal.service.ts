import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentModalService {
  pipe(arg0: MonoTypeOperatorFunction<unknown>) {
    throw new Error('Method not implemented.');
  }
  private modal = new Subject<any>();
  //Modal
  // modalRef: BsModalRef;
  // private modalService: BsModalService
  constructor() {}

  setPaymentModal(modal) {
    this.modal.next(modal);
  }
  getPaymentModal() {
    return this.modal.asObservable();
  }

}
