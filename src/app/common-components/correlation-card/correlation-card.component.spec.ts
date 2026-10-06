import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationCardComponent } from './correlation-card.component';

describe('CorrelationCardComponent', () => {
  let component: CorrelationCardComponent;
  let fixture: ComponentFixture<CorrelationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrelationCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrelationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
