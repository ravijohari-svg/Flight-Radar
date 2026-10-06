import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityLayoutComponent } from './authority-layout.component';

describe('AuthorityLayoutComponent', () => {
  let component: AuthorityLayoutComponent;
  let fixture: ComponentFixture<AuthorityLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
