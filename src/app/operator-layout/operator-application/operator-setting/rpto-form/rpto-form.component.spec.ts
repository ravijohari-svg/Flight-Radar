import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RptoFormComponent } from './rpto-form.component';

describe('RptoFormComponent', () => {
  let component: RptoFormComponent;
  let fixture: ComponentFixture<RptoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RptoFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RptoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
