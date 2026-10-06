import { TestBed } from '@angular/core/testing';

import { NetworkAwarePreloadService } from './network-aware-preload.service';

describe('NetworkAwarePreloadService', () => {
  let service: NetworkAwarePreloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkAwarePreloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
