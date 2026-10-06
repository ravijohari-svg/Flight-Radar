import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DronesGearsListComponent } from './drones-gears-list.component';

describe('DronesGearsListComponent', () => {
  let component: DronesGearsListComponent;
  let fixture: ComponentFixture<DronesGearsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DronesGearsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DronesGearsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
