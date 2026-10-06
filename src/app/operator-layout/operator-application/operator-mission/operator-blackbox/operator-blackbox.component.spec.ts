import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorBlackboxComponent } from './operator-blackbox.component';

describe('OperatorBlackboxComponent', () => {
  let component: OperatorBlackboxComponent;
  let fixture: ComponentFixture<OperatorBlackboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorBlackboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorBlackboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
