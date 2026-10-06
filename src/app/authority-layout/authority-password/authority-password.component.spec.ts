import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityPasswordComponent } from './authority-password.component';

describe('AuthorityPasswordComponent', () => {
  let component: AuthorityPasswordComponent;
  let fixture: ComponentFixture<AuthorityPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
