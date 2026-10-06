import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityFlightRadarComponent } from './authority-flight-radar.component';

describe('AuthorityFlightRadarComponent', () => {
  let component: AuthorityFlightRadarComponent;
  let fixture: ComponentFixture<AuthorityFlightRadarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuthorityFlightRadarComponent]
    });
    fixture = TestBed.createComponent(AuthorityFlightRadarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
