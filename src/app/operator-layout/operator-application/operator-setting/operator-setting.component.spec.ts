import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorSettingComponent } from './operator-setting.component';

describe('OperatorSettingComponent', () => {
  let component: OperatorSettingComponent;
  let fixture: ComponentFixture<OperatorSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
