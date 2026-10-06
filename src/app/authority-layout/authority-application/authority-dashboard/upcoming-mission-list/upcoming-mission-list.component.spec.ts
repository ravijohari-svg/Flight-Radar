import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingMissionListComponent } from './upcoming-mission-list.component';

describe('UpcomingMissionListComponent', () => {
  let component: UpcomingMissionListComponent;
  let fixture: ComponentFixture<UpcomingMissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingMissionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingMissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
