import { TestBed } from '@angular/core/testing';

import { AuthorityapisService } from './authorityapis.service';

describe('AuthorityapisService', () => {
  let service: AuthorityapisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorityapisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
