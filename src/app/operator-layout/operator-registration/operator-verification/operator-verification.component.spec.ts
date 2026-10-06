import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorVerificationComponent } from './operator-verification.component';

describe('OperatorVerificationComponent', () => {
  let component: OperatorVerificationComponent;
  let fixture: ComponentFixture<OperatorVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
