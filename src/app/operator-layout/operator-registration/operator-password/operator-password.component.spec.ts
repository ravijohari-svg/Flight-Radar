import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorPasswordComponent } from './operator-password.component';

describe('OperatorPasswordComponent', () => {
  let component: OperatorPasswordComponent;
  let fixture: ComponentFixture<OperatorPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
