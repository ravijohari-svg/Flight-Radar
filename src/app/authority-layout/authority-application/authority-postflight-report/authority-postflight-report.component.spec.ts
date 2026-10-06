import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityPostflightReportComponent } from './authority-postflight-report.component';

describe('AuthorityPostflightReportComponent', () => {
  let component: AuthorityPostflightReportComponent;
  let fixture: ComponentFixture<AuthorityPostflightReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityPostflightReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityPostflightReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
