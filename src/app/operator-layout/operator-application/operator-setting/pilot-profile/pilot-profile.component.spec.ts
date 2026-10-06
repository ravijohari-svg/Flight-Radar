import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilotProfileComponent } from './pilot-profile.component';

describe('PilotProfileComponent', () => {
  let component: PilotProfileComponent;
  let fixture: ComponentFixture<PilotProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PilotProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PilotProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
