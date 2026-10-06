import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityDroneParametersComponent } from './authority-drone-parameters.component';

describe('AuthorityDroneParametersComponent', () => {
  let component: AuthorityDroneParametersComponent;
  let fixture: ComponentFixture<AuthorityDroneParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityDroneParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityDroneParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
