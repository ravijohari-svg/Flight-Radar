import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityPilotsComponent } from './authority-pilots.component';

describe('AuthorityPilotsComponent', () => {
  let component: AuthorityPilotsComponent;
  let fixture: ComponentFixture<AuthorityPilotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityPilotsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityPilotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
