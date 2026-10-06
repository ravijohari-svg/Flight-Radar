import { TestBed } from '@angular/core/testing';

import { RptoGuard } from './rpto.guard';

describe('RptoGuard', () => {
  let guard: RptoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RptoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
