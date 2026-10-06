import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorPaymentPageComponent } from './operator-payment-page.component';

describe('PageComponent', () => {
  let component: OperatorPaymentPageComponent;
  let fixture: ComponentFixture<OperatorPaymentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorPaymentPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorPaymentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
