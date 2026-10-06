import { TestBed } from '@angular/core/testing';

import { PaymentModalService } from './payment-modal.service';

describe('PaymentModalService', () => {
  let service: PaymentModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
