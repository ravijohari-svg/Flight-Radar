import { TestBed } from '@angular/core/testing';

import { AuthLevelGuard } from './auth-level.guard';

describe('AuthLevelGuard', () => {
  let guard: AuthLevelGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthLevelGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
