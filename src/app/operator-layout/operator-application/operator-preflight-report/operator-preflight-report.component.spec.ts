import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorPreflightReportComponent } from './operator-preflight-report.component';

describe('OperatorPreflightReportComponent', () => {
  let component: OperatorPreflightReportComponent;
  let fixture: ComponentFixture<OperatorPreflightReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorPreflightReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorPreflightReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
