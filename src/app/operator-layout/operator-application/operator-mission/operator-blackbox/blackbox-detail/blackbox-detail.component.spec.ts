import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlackboxDetailComponent } from './blackbox-detail.component';

describe('BlackboxDetailComponent', () => {
  let component: BlackboxDetailComponent;
  let fixture: ComponentFixture<BlackboxDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlackboxDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlackboxDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
