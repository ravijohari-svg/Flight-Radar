import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityRuleEngineComponent } from './authority-rule-engine.component';

describe('AuthorityRuleEngineComponent', () => {
  let component: AuthorityRuleEngineComponent;
  let fixture: ComponentFixture<AuthorityRuleEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorityRuleEngineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityRuleEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
