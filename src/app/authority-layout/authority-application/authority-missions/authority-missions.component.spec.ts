import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityMissionsComponent } from './authority-missions.component';

describe('AuthorityMissionsComponent', () => {
  let component: AuthorityMissionsComponent;
  let fixture: ComponentFixture<AuthorityMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityMissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
