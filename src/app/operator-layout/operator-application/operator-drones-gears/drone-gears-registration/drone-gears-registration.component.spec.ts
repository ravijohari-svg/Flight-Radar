import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroneGearsRegistrationComponent } from './drone-gears-registration.component';

describe('DroneGearsRegistrationComponent', () => {
  let component: DroneGearsRegistrationComponent;
  let fixture: ComponentFixture<DroneGearsRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DroneGearsRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DroneGearsRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
