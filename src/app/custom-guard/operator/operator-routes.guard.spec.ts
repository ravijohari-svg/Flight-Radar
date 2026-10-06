import { TestBed } from '@angular/core/testing';

import { OperatorRoutesGuard } from './operator-routes.guard';

describe('OperatorRoutesGuard', () => {
  let guard: OperatorRoutesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OperatorRoutesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
