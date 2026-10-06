import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityMissionParametersComponent } from './authority-mission-parameters.component';

describe('AuthorityMissionParametersComponent', () => {
  let component: AuthorityMissionParametersComponent;
  let fixture: ComponentFixture<AuthorityMissionParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityMissionParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityMissionParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
