import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaypointFormCardComponent } from './waypoint-form-card.component';

describe('WaypointFormCardComponent', () => {
  let component: WaypointFormCardComponent;
  let fixture: ComponentFixture<WaypointFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaypointFormCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaypointFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
