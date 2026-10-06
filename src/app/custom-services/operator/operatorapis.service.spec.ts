import { TestBed } from '@angular/core/testing';

import { OperatorapisService } from './operatorapis.service';

describe('OperatorapisService', () => {
  let service: OperatorapisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatorapisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
