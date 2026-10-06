import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityBlackboxComponent } from './authority-blackbox.component';

describe('AuthorityBlackboxComponent', () => {
  let component: AuthorityBlackboxComponent;
  let fixture: ComponentFixture<AuthorityBlackboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityBlackboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityBlackboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
