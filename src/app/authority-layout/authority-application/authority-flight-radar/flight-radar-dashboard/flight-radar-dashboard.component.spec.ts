import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightRadarDashboardComponent } from './flight-radar-dashboard.component';

describe('FlightRadarDashboardComponent', () => {
  let component: FlightRadarDashboardComponent;
  let fixture: ComponentFixture<FlightRadarDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlightRadarDashboardComponent]
    });
    fixture = TestBed.createComponent(FlightRadarDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
