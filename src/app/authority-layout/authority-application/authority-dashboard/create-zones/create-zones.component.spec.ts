import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateZonesComponent } from './create-zones.component';

describe('CreateZonesComponent', () => {
  let component: CreateZonesComponent;
  let fixture: ComponentFixture<CreateZonesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateZonesComponent]
    });
    fixture = TestBed.createComponent(CreateZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
