import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityApplicationComponent } from './authority-application.component';

describe('AuthorityApplicationComponent', () => {
  let component: AuthorityApplicationComponent;
  let fixture: ComponentFixture<AuthorityApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityApplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
