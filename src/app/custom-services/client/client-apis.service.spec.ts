import { TestBed } from '@angular/core/testing';

import { ClientApisService } from './client-apis.service';

describe('ClientApisService', () => {
  let service: ClientApisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientApisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
