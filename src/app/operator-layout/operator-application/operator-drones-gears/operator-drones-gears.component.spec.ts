import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorDronesGearsComponent } from './operator-drones-gears.component';

describe('OperatorDronesGearsComponent', () => {
  let component: OperatorDronesGearsComponent;
  let fixture: ComponentFixture<OperatorDronesGearsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorDronesGearsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorDronesGearsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
