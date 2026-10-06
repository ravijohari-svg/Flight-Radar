import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRemoteidComponent } from './authority-remoteid.component';

describe('AuthorityRemoteidComponent', () => {
  let component: AuthorityRemoteidComponent;
  let fixture: ComponentFixture<AuthorityRemoteidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityRemoteidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRemoteidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
