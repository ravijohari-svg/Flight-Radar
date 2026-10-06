import { TestBed } from '@angular/core/testing';

import { NetworkPreLoadOperatorService } from './network-pre-load-operator.service';

describe('NetworkPreLoadOperatorService', () => {
  let service: NetworkPreLoadOperatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkPreLoadOperatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
