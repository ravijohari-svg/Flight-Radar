import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackboxListComponent } from './blackbox-list.component';

describe('BlackboxListComponent', () => {
  let component: BlackboxListComponent;
  let fixture: ComponentFixture<BlackboxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlackboxListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackboxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
