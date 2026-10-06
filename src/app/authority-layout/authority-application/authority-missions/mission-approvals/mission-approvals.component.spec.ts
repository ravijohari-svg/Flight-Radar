import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionApprovalsComponent } from './mission-approvals.component';

describe('MissionApprovalsComponent', () => {
  let component: MissionApprovalsComponent;
  let fixture: ComponentFixture<MissionApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionApprovalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
