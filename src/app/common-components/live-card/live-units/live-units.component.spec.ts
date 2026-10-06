import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveUnitsComponent } from './live-units.component';

describe('LiveUnitsComponent', () => {
  let component: LiveUnitsComponent;
  let fixture: ComponentFixture<LiveUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveUnitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
