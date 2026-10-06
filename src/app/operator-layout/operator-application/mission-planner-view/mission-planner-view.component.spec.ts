import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPlannerViewComponent } from './mission-planner-view.component';

describe('MissionPlannerViewComponent', () => {
  let component: MissionPlannerViewComponent;
  let fixture: ComponentFixture<MissionPlannerViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissionPlannerViewComponent]
    });
    fixture = TestBed.createComponent(MissionPlannerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
