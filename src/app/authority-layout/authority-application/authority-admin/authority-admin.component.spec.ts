import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityAdminComponent } from './authority-admin.component';

describe('AuthorityAdminComponent', () => {
  let component: AuthorityAdminComponent;
  let fixture: ComponentFixture<AuthorityAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
