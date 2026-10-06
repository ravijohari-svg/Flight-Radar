import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorRegisterComponent } from './operator-register.component';

describe('OperatorRegisterComponent', () => {
  let component: OperatorRegisterComponent;
  let fixture: ComponentFixture<OperatorRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
