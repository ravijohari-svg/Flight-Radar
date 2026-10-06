import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorNewLandingPageComponent } from './operator-new-landing-page.component';

describe('OperatorNewLandingPageComponent', () => {
  let component: OperatorNewLandingPageComponent;
  let fixture: ComponentFixture<OperatorNewLandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperatorNewLandingPageComponent]
    });
    fixture = TestBed.createComponent(OperatorNewLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
