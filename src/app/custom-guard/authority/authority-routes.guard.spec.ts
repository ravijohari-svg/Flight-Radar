import { TestBed } from '@angular/core/testing';

import { AuthorityRoutesGuard } from './authority-routes.guard';

describe('AuthorityRoutesGuard', () => {
  let guard: AuthorityRoutesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthorityRoutesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
