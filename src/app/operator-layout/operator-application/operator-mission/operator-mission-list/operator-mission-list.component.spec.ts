import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorMissionListComponent } from './operator-mission-list.component';

describe('OperatorMissionListComponent', () => {
  let component: OperatorMissionListComponent;
  let fixture: ComponentFixture<OperatorMissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorMissionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorMissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
