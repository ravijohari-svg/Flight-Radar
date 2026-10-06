import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorCreateMissionComponent } from './operator-create-mission.component';

describe('OperatorCreateMissionComponent', () => {
  let component: OperatorCreateMissionComponent;
  let fixture: ComponentFixture<OperatorCreateMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorCreateMissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorCreateMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
