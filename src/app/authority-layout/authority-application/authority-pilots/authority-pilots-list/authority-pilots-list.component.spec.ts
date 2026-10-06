import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityPilotsListComponent } from './authority-pilots-list.component';

describe('AuthorityPilotsListComponent', () => {
  let component: AuthorityPilotsListComponent;
  let fixture: ComponentFixture<AuthorityPilotsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityPilotsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityPilotsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
