import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorLandingPageComponent } from './operator-landing-page.component';

describe('OperatorLandingPageComponent', () => {
  let component: OperatorLandingPageComponent;
  let fixture: ComponentFixture<OperatorLandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperatorLandingPageComponent]
    });
    fixture = TestBed.createComponent(OperatorLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
