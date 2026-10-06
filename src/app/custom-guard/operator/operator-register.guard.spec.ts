import { TestBed } from '@angular/core/testing';

import { OperatorRegisterGuard } from './operator-register.guard';

describe('OperatorRegisterGuard', () => {
  let guard: OperatorRegisterGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OperatorRegisterGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
