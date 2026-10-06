import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityPreflightReportComponent } from './authority-preflight-report.component';

describe('AuthorityPreflightReportComponent', () => {
  let component: AuthorityPreflightReportComponent;
  let fixture: ComponentFixture<AuthorityPreflightReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityPreflightReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityPreflightReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
