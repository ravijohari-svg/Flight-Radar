import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCcavenueComponent } from './test-ccavenue.component';

describe('TestCcavenueComponent', () => {
  let component: TestCcavenueComponent;
  let fixture: ComponentFixture<TestCcavenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestCcavenueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCcavenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
